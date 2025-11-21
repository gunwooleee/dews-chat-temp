def appFrontend
def appProxy

node {
    stage('Checkout') {
        checkout scm
    }

    stage('Build images') {
        appFrontend = docker.build("genaidews/chat")
    }

    stage('Push images') {
        docker.withRegistry("http://10.220.1.14:50005", "harbor") {
            appFrontend.push("${env.BUILD_NUMBER}")
            appFrontend.push("latest")
        }
    }

    stage('SSH-Server-Deploy') {
        sh "echo 'SSH'"

        sshagent(credentials: ['ssh']) {
            sh 'scp -o StrictHostKeyChecking=no -P 1022 docker-compose.yaml admin@1.244.116.31:/home/admin/'
            sh 'ssh -o StrictHostKeyChecking=no -p 1022 admin@1.244.116.31 "cd /home/admin"'
            sh 'ssh -o StrictHostKeyChecking=no -p 1022 admin@1.244.116.31 "docker rm -f portal-frontend"'
            sh 'ssh -o StrictHostKeyChecking=no -p 1022 admin@1.244.116.31 "docker rmi -f 10.220.1.14:50005/genaidews/chat"'
            sh 'ssh -o StrictHostKeyChecking=no -p 1022 admin@1.244.116.31 "docker compose up -d"'
            sh 'ssh -o StrictHostKeyChecking=no -p 1022 admin@1.244.116.31 "docker compose ps"'
            sh 'ssh -o StrictHostKeyChecking=no -p 1022 admin@1.244.116.31 "rm -f docker-compose.yaml"'
        }

        sshagent(credentials: ['ssh']) {
            sh 'scp -o StrictHostKeyChecking=no -P 1022 docker-compose.yaml admin@1.244.116.32:/home/admin/'
            sh 'ssh -o StrictHostKeyChecking=no -p 1022 admin@1.244.116.32 "cd /home/admin"'
            sh 'ssh -o StrictHostKeyChecking=no -p 1022 admin@1.244.116.32 "docker rm -f portal-frontend"'
            sh 'ssh -o StrictHostKeyChecking=no -p 1022 admin@1.244.116.32 "docker rmi -f 10.220.1.14:50005/genaidews/chat"'
            sh 'ssh -o StrictHostKeyChecking=no -p 1022 admin@1.244.116.32 "docker compose up -d"'
            sh 'ssh -o StrictHostKeyChecking=no -p 1022 admin@1.244.116.32 "docker compose ps"'
            sh 'ssh -o StrictHostKeyChecking=no -p 1022 admin@1.244.116.32 "rm -f docker-compose.yaml"'
        }
    }

    stage('Complete') {
        sh "echo 'The end'"
    }
}