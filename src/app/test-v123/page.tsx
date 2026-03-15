'use client'; 
export default function Page() { 
    return (
        <div style={{ padding: '4rem', textAlign: 'center' }}>
            <h1>🚀 Bolton Digital Deployment Test</h1>
            <p>Si ves esto, el despliegue en Vercel está funcionando correctamente.</p>
            <p>Time: {new Date().toISOString()}</p>
        </div>
    ); 
}
