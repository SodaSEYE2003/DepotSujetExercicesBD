import os
import re
import json
import sqlparse
from PyPDF2 import PdfReader
from cryptography.fernet import Fernet
import ollama
from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Optional
from pydantic import BaseModel
from io import BytesIO

# Configuration initiale
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modèle de données
class ExerciseData(BaseModel):
    prompt: str
    correction_guidelines: str
    model_answers: List[str]

class EvaluationResult(BaseModel):
    score: float
    errors: List[str]
    correct_answer: str
    suggestions: List[str]
    sql_analysis: Optional[List[Dict]]

# Chargement du modèle IA
try:
    MODEL_NAME = "deepseek-coder"
    ollama.pull(MODEL_NAME)
except Exception as e:
    print(f"Erreur lors du chargement du modèle: {e}")
    MODEL_NAME = "deepseek-llm"  # Fallback

# Clé de chiffrement (à stocker de manière sécurisée en production)
KEY = Fernet.generate_key()
cipher = Fernet(KEY)

def encrypt_file(content: bytes) -> bytes:
    return cipher.encrypt(content)

def decrypt_file(encrypted_content: bytes) -> bytes:
    return cipher.decrypt(encrypted_content)

def save_uploaded_file(file: UploadFile) -> str:
    """Sauvegarde le fichier uploadé de manière sécurisée"""
    file_path = f"temp_{file.filename}"
    with open(file_path, "wb") as f:
        content = file.file.read()
        encrypted = encrypt_file(content)
        f.write(encrypted)
    return file_path

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extrait le texte d'un PDF chiffré"""
    text = ""
    try:
        with open(pdf_path, "rb") as file:
            decrypted = decrypt_file(file.read())
            # Convertir les bytes en stream
            pdf_stream = BytesIO(decrypted)
            reader = PdfReader(pdf_stream)
            for page in reader.pages:
                text += page.extract_text()
    except Exception as e:
        print(f"Erreur d'extraction PDF: {e}")
    return text

def analyze_sql_queries(text: str) -> List[Dict]:
    """Analyse les requêtes SQL trouvées dans le texte"""
    sql_queries = re.findall(r'(SELECT|INSERT|UPDATE|DELETE).*?;', text, re.IGNORECASE | re.DOTALL)
    results = []
    
    for query in sql_queries:
        try:
            parsed = sqlparse.parse(query)
            if not parsed:
                continue
                
            first_stmt = parsed[0]
            is_valid = not first_stmt.is_incomplete
            tokens = [str(t) for t in first_stmt.tokens if not t.is_whitespace]
            
            # Détermination du type plus simple
            query_type = "UNKNOWN"
            for token in first_stmt.tokens:
                if token.ttype is None and isinstance(token, sqlparse.sql.Token):
                    query_type = token.value.upper()
                    break
                
        except Exception as e:
            print(f"Erreur d'analyse SQL: {e}")
            is_valid = False
            tokens = []
            query_type = "UNKNOWN"
        
        results.append({
            'query': query.strip(),
            'valid': is_valid,
            'tokens': tokens,
            'type': query_type
        })
    
    return results

def generate_evaluation_prompt(exercise_prompt: str, student_answer: str, correction_guidelines: str) -> str:
    """Génère le prompt pour l'évaluation par l'IA"""
    return f"""
    [Rôle]: Vous êtes un expert en bases de données chargé de corriger des exercices d'étudiants.
    [Exercice]: {exercise_prompt}
    [Correction Attendue]: {correction_guidelines}
    [Réponse Étudiant]: {student_answer}

    Veuillez fournir:
    1. Une note sur 20 avec justification détaillée
    2. La liste des erreurs détectées
    3. Une correction complète et optimisée
    4. Des suggestions d'amélioration spécifiques

    Format de réponse attendu (JSON):
    {{
        "score": float (entre 0 et 20),
        "errors": [liste des erreurs],
        "correct_answer": "réponse correcte complète",
        "suggestions": [conseils d'amélioration]
    }}
    """

def parse_ai_response(response: str) -> Dict:
    """Tente de parser la réponse JSON de l'IA"""
    try:
        # Essaye d'extraire le JSON de la réponse
        json_str = re.search(r'\{.*\}', response, re.DOTALL).group()
        return json.loads(json_str)
    except (AttributeError, json.JSONDecodeError) as e:
        print(f"Erreur de parsing de la réponse IA: {e}")
        return {
            "score": 0,
            "errors": ["Format de la réponse incorrecte"],
            "correct_answer": "",
            "suggestions": ["Contactez votre professeur"]
        }

async def evaluate_submission(exercise_data: ExerciseData, student_pdf_path: str) -> EvaluationResult:
    """Processus complet d'évaluation"""
    # Extraction du texte
    student_answer = extract_text_from_pdf(student_pdf_path)
    print("réponse de l'étudiant :", student_answer)
    
    # Analyse SQL si pertinent
    sql_analysis = None
    if "SQL" in exercise_data.prompt.upper():
        sql_analysis = analyze_sql_queries(student_answer)
    
    # Génération de la correction
    prompt = generate_evaluation_prompt(
        exercise_data.prompt,
        student_answer,
        exercise_data.correction_guidelines
    )
    print("prompt généré :", prompt)
    try:
        response = ollama.generate(
            model=MODEL_NAME,
            prompt=prompt,
            format="json",
            options={
                "temperature": 0.3,  # Plus déterministe
                "num_ctx": 4096  # Contexte plus long
            }
        )
        evaluation = parse_ai_response(response["response"])
    except Exception as e:
        print(f"Erreur lors de l'appel à Ollama: {e}")
        evaluation = {
            "score": 0,
            "errors": ["Erreur du système de correction"],
            "correct_answer": "",
            "suggestions": []
        }
    
    return EvaluationResult(
        score=evaluation["score"],
        errors=evaluation["errors"],
        correct_answer=evaluation["correct_answer"],
        suggestions=evaluation["suggestions"],
        sql_analysis=sql_analysis
    )

# Endpoint API
@app.post("/evaluate/{exercise_id}")
async def evaluate(
    exercise_id: str,
    file: UploadFile,
    professor_feedback: Optional[str] = None
):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(400, "Seuls les fichiers PDF sont acceptés")
    
    # En production, récupérer ces données depuis une base de données
    EXERCISE_DB = {
        "ex1": ExerciseData(
            prompt="Écrivez une requête SQL qui récupère les clients avec plus de 5 commandes en 2024",
            correction_guidelines="""
            La requête doit:
            1. Joindre les tables clients et commandes 
            2. Filtrer par année 2024
            3. Grouper par client
            4. Filtrer avec HAVING COUNT > 5
            5. Sélectionner seulement nom et prénom
            """,
            model_answers=[
                "SELECT c.nom, c.prenom FROM clients c JOIN commandes cmd ON c.id = cmd.client_id WHERE YEAR(cmd.date_commande) = 2024 GROUP BY c.id HAVING COUNT(cmd.id) > 5;"
            ]
        )
    }
    
    if exercise_id not in EXERCISE_DB:
        raise HTTPException(404, "Exercice non trouvé")
    
    # Sauvegarde et évaluation
    pdf_path = save_uploaded_file(file)
    result = await evaluate_submission(EXERCISE_DB[exercise_id], pdf_path)
    
    # Nettoyage
    os.remove(pdf_path)
    
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)