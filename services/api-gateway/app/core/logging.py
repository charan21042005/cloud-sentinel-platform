import logging
import sys

def setup_logging():
    """
    Configures structured logging for the application.
    In production, this could be extended to output JSON for Loki/CloudWatch.
    """
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    # Suppress verbose logging from third-party libraries
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    
    logger = logging.getLogger("sentinel-api")
    return logger

logger = setup_logging()
