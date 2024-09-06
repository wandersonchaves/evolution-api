#!/bin/bash

# Sincronizar com o repositório upstream
git fetch upstream
git checkout main       # Certifique-se de estar na branch principal
git merge upstream/main # Mescla as mudanças do upstream/main na sua branch local

# Push para o seu fork no GitHub
git push origin main
