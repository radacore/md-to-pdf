# Test Mermaid Diagram

Berikut adalah contoh diagram Mermaid yang akan dirender sebagai gambar:

## Diagram Website vs Restoran

```mermaid
flowchart LR
    subgraph "🍽️ RESTORAN (Analogi)"
        A["Menu & Meja<br>🍽️"] --> B["Pramusaji<br>🧑‍🍳"]
        B --> C["Dapur<br>🔥"]
        C --> D["Gudang Bahan<br>📦"]
    end
    
    subgraph "💻 WEBSITE (Realita)"
        E["Frontend<br>HTML/CSS/JS"] --> F["Backend<br>PHP"]
        F --> G["Server<br>Apache"]
        G --> H["Database<br>MySQL"]
    end
    
    A -.->|sama seperti| E
    B -.->|sama seperti| F
    D -.->|sama seperti| H
```

## Flowchart Sederhana

```mermaid
flowchart TD
    A[Start] --> B{Apakah user login?}
    B -->|Ya| C[Dashboard]
    B -->|Tidak| D[Halaman Login]
    D --> E[Form Login]
    E --> F{Valid?}
    F -->|Ya| C
    F -->|Tidak| G[Error Message]
    G --> E
```

## Sequence Diagram

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Server
    participant Database
    
    User->>Browser: Klik Login
    Browser->>Server: POST /login
    Server->>Database: Cek credentials
    Database-->>Server: User data
    Server-->>Browser: Session token
    Browser-->>User: Redirect ke dashboard
```

Ini adalah teks biasa setelah diagram.
