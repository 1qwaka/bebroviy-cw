set windows-shell := ["powershell.exe", "-NoLogo", "-Command"]


# включает ингресс в миникубе
enable-ingress:
    minikube addons enable ingress

# запускает кубернетес кластер миникуба
start:
    minikube start

# останавливает кубернетес кластер миникуба
stop:
    minikube stop
    
# пробрасывает туннель в хостовую ос чтобы можно было достучаться до ингресса внутри кластера
tunnel:
    minikube tunnel

dashboard:
    minikube dashboard

# удаляет постгрес из кластера и его данные (volume)
remove-postgres:
    helm uninstall postgres
    kubectl delete pvc -l app.kubernetes.io/instance=postgres
    kubectl delete configmap postgres-init

# добавляет постгрес в кластер (если volume нету то создаст и вызовет инит скрипты на нем)
install-postgres:
    kubectl create configmap postgres-init --from-file=./postgres/
    helm install postgres bitnami/postgresql --set primary.initdb.scriptsConfigMap=postgres-init

remove-kafka:
    helm uninstall kafka
    kubectl delete pvc -l app.kubernetes.io/instance=kafka

install-kafka:
    helm install kafka bitnami/kafka --set kraft.enabled=true --set zookeeper.enabled=false --set replicaCount=1 --set listeners.client.protocol=PLAINTEXT --set image.tag=3.7.0-debian-12-r10


# пробрасывает туннель к посгресу чтобы можно было с хостовой машины, например, с дбивера подключиться
tunnel-postgres:
    kubectl port-forward --namespace default svc/postgres-postgresql 5432:5432


# собирает и пушит все образы в докер хаб
publish-images:
    docker-compose build
    docker-compose push

install-all-services:
    helm install idp charts/bebroviy -f charts/bebroviy/idp-values.yaml
    helm install ui charts/bebroviy -f charts/bebroviy/ui-values.yaml
    helm install loyalty charts/bebroviy -f charts/bebroviy/loyalty-values.yaml
    helm install reservation charts/bebroviy -f charts/bebroviy/reservation-values.yaml
    helm install payments charts/bebroviy -f charts/bebroviy/payments-values.yaml
    helm install gateway charts/bebroviy -f charts/bebroviy/gateway-values.yaml
    helm install statistics charts/bebroviy -f charts/bebroviy/statistics-values.yaml

uninstall-all-services:
    helm uninstall idp
    helm uninstall ui
    helm uninstall loyalty
    helm uninstall reservation
    helm uninstall payments
    helm uninstall gateway
    helm uninstall statistics