export_env_vars() {
    if [ "$DOCKER_ENV" == "true" ]; then
        echo "✅ DOCKER_ENV=true: variáveis de ambiente fornecidas externamente (Railway ou docker-compose)."
    elif [ -f .env ]; then
        echo "📦 Carregando variáveis do .env local..."
        export $(grep -v '^#' .env | xargs)
    else
        echo "❌ .env file not found and DOCKER_ENV is not set. Exiting..."
        exit 1
    fi
}