echo "Destroying old containers"

sudo docker stop datenbank-project-db
sudo docker stop datenbank-project-pgadmin

sudo docker rm datenbank-project-db
sudo docker rm datenbank-project-pgadmin

echo "Creating new containers"

sudo docker run -d --name datenbank-project-db -e POSTGRES_PASSWORD=Pass1234# -p 9000:5432 postgres

echo "Success! Postgres container created"

sudo docker run --name datenbank-project-pgadmin -p 9001:5050 -d thajeztah/pgadmin4

echo "Success! PGAdmin container created"

sudo docker container ls