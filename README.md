# Group 14 
# Team Members
Ilham MIM - 230257A<br>
Kulathunge KANH - 230349H<br>
Thabrew DCL- 230631P<br>
Gunawardena HA - 230219K<br>
Wansandi MGJ - 230684E<br>

flowchart LR
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
