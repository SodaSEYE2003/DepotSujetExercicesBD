import ollama
response = ollama.generate(
    model='deepseek-coder',
    prompt='quelle est la différence entre inner join et left join',
)
print(response['response'])