
User[User / Browser]
Frontend[React Frontend<br/>Tailwind CSS]
Backend[Node.js + Express API<br/>JWT Authentication]
Database[(MySQL Database<br/>AWS RDS)]
Docker[Docker Container]
EC2[AWS EC2 Instance]

User --> Frontend
Frontend -->|HTTP / REST API| Backend
Backend -->|JWT Auth| Backend
Backend --> Database

Backend --> Docker                
Docker --> EC2
