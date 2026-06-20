pipeline {
    agent any

    tools {
        nodejs 'node-20'
    }

    stages {
        // STEP 1: Dynamically pull the code from Git into Jenkins workspace
        stage('Checkout Source Code') {
            steps {
                cleanWs() // Optional: Cleans the workspace directory before building
                checkout scm // Instructs Jenkins to pull code from the Git repo tied to this job
            }
        }

        stage('Build Frontend (NextJs)') {
            steps {
                echo 'Building NextJs Frontend application from Git workspace...'
                bat 'npm install'
                bat 'npm run build'
            }
        }
        
        stage('Deploy with Docker') {
            steps {
                script {                    
                    echo 'Cleaning up existing frontend container...'
                    try { bat 'docker stop my-crud-app-nextjs || ver > nul' } catch (Exception e) {}
                    try { bat 'docker rm my-crud-app-nextjs || ver > nul' } catch (Exception e) {}
                    
                    echo 'Building and running the NextJs Frontend container...'
                    bat 'docker build -t frontendnextjs-image .'
                    
                    // CHANGED: Map host 3001 to container 3000
                    bat 'docker run -d -p 3001:3000 --name my-crud-app-nextjs frontendnextjs-image'
                    
                    echo 'Frontend (3001) has been deployed successfully!'
                }
            }
        }
    }

    post {
        success {
            echo 'Frontend built and deployed successfully!'
        }
        failure {
            echo 'The pipeline build encountered an error. Check logs above.'
        }
    }
}