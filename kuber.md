### постгрес

создание секрета для чарта постгрес
kubectl create secret generic postgres-secret --from-literal=postgres-password=test --from-literal=password=test

создание конфиг мапы из инит скриптов
kubectl create configmap postgres-init --from-file=./postgres/

деплой базы из чарта с конфигом
helm install postgres bitnami/postgresql --set primary.initdb.scriptsConfigMap=postgres-init
    можно было бы и так, если бы в инит скриптах не было уже прописано создание юзера
    helm install postgres bitnami/postgresql --set auth.existingSecret=postgres-secret  --set auth.username=program --set primary.initdb.scriptsConfigMap=postgres-init

для подключения клиентом снаружи
kubectl port-forward --namespace default svc/postgres-postgresql 5432:5432


### сервисы
создание секрета для сервисов
kubectl create secret generic my-secret --from-literal=DB_USER=program --from-literal=DB_PASS=test

установка
helm install gateway charts/bebroviy -f charts/bebroviy/gateway-values.yaml
helm install loyalty charts/bebroviy -f charts/bebroviy/loyalty-values.yaml
helm install reservation charts/bebroviy -f charts/bebroviy/reservation-values.yaml
helm install payments charts/bebroviy -f charts/bebroviy/payments-values.yaml

