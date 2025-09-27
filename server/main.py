from fastapi import FastAPI

app = FastAPI(title="CALOCUT Day1")


@app.get("/health")
def health():
    return {"ok": True}
