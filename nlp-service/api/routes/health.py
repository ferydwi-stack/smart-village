from fastapi import APIRouter
from core.nlp_pipeline import NLPClassifier

router = APIRouter()
nlp_classifier = NLPClassifier()

@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "model_loaded": nlp_classifier.model_loaded,
        "version": "1.0.0"
    }
