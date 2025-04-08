from flask import Flask, render_template, request, redirect, url_for
import requests
import os
import uuid

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'test_uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Configuration de l'API FastAPI
API_URL = "http://localhost:8000"  # Remplacez par l'URL de votre API en production

# Exercice de test (à remplacer par un appel API en production)
TEST_EXERCISE = {
    "id": "ex1",
    "description": "Écrivez une requête SQL qui récupère les clients avec plus de 5 commandes en 2024"
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/professor', methods=['GET', 'POST'])
def professor():
    if request.method == 'POST':
        # En production: envoyer le sujet à l'API pour création
        return redirect(url_for('index'))
    return render_template('professor.html', exercise=TEST_EXERCISE)

@app.route('/student', methods=['GET', 'POST'])
def student():
    if request.method == 'POST':
        # Enregistrement du fichier PDF
        file = request.files['submission']
        if file and file.filename.endswith('.pdf'):
            filename = f"{uuid.uuid4()}.pdf"
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # Envoi à l'API FastAPI
            try:
                with open(filepath, 'rb') as f:
                    files = {'file': (filename, f, 'application/pdf')}
                    response = requests.post(
                        f"{API_URL}/evaluate/{TEST_EXERCISE['id']}",
                        files=files
                    )
                
                if response.status_code == 200:
                    result = response.json()
                    return render_template('result.html', result=result)
                else:
                    error = f"Erreur API: {response.status_code} - {response.text}"
            except Exception as e:
                error = f"Erreur de connexion à l'API: {str(e)}"
            finally:
                os.remove(filepath)
            
            return render_template('error.html', error=error)
    
    return render_template('student.html', exercise=TEST_EXERCISE)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)