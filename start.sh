#!/bin/bash

# Faz backup do banco
docker exec -it mongo bash -c "mongodump -v --db finantial -o /backup"

# Derruba os sistemas antigos
docker-compose down --remove-orphans
echo "Subindo banco"

docker-compose up -d mongo
echo "Aguardando banco"

while true
do
    string=$(docker-compose logs --tail=1)
    if [[ $string = *"build index done"* ]]
    then
        echo "Banco iniciado"
        break
    fi
    sleep 1
done

echo "Subindo sistema"

# Restaura o backup do banco
docker exec -it mongo bash -c "mongorestore /backup"
docker-compose up -d --force-recreate --build service
