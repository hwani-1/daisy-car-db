import os
from dotenv import load_dotenv
load_dotenv()

class Config:
    MONGO_URI = os.environ.get('MONGO_URI')
    AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
    AWS_S3_BUCKET_NAME = os.environ.get('AWS_S3_BUCKET_NAME')
    AWS_S3_REGION = os.environ.get('AWS_S3_REGION')
    FLASK_ADMIN_SWATCH = os.environ.get('FLASK_ADMIN_SWATCH', 'cerulean')