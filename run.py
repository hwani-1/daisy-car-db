import os
import io
import boto3
from flask import Flask
from flask_admin import Admin
from flask_admin.contrib.mongoengine import ModelView
from mongoengine import connect, Document, StringField, ListField, ReferenceField
from flask_cors import CORS
from config import Config
from wtforms.fields import FileField
from werkzeug.utils import secure_filename

# --- Flask App Initialization ---
app = Flask(__name__)
app.config.from_object(Config)
app.config['SECRET_KEY'] = 'a-very-secret-key'
CORS(app)

# --- Database Connection ---
connect(host=app.config['MONGO_URI'])

# --- AWS S3 Setup ---
s3 = boto3.client(
    's3',
    aws_access_key_id=app.config['AWS_ACCESS_KEY_ID'],
    aws_secret_access_key=app.config['AWS_SECRET_ACCESS_KEY'],
    region_name=app.config['AWS_S3_REGION']
)
S3_BUCKET_NAME = app.config['AWS_S3_BUCKET_NAME']

# --- S3 Upload Helper Function ---
def upload_file_to_s3(file, bucket_name, object_name=None):
    if object_name is None:
        object_name = secure_filename(file.filename)
    try:
        s3.upload_fileobj(
            file,
            bucket_name,
            object_name,
            ExtraArgs={'ACL': 'public-read', 'ContentType': file.content_type}
        )
        region = app.config['AWS_S3_REGION']
        return f"https://{bucket_name}.s3.{region}.amazonaws.com/{object_name}"
    except Exception as e:
        print(f"S3 업로드 에러: {e}")
        return None

# --- Database Models ---
class Car(Document):
    name = StringField(max_length=100, required=True, unique=True)
    class_name = StringField(max_length=50, required=True, choices=['소형', '준중형', '중형', '대형', 'SUV', '스포츠', '슈퍼카', '레전드'])
    car_image_url = StringField()

    def __str__(self):
        return self.name

class CosmeticSet(Document):
    set_name = StringField(max_length=100, required=True)
    car = ReferenceField(Car, required=True)
    set_effects = StringField()
    parts = ListField(StringField(max_length=50))
    # Change to three image URLs
    image_url_front = StringField()
    image_url_side = StringField()
    image_url_rear = StringField()

# --- Admin Panel Setup ---
admin = Admin(app, name='Car Cosmetics DB', template_mode='bootstrap3')

class CarView(ModelView):
    column_list = ('name', 'class_name')
    column_labels = {'name': '차량 이름', 'class_name': '클래스'}
    column_default_sort = 'class_name'
    form_excluded_columns = ('car_image_url',)
    form_extra_fields = {
        'image': FileField('대표 이미지 업로드')
    }

    def on_model_change(self, form, model, is_created):
        file = form.image.data
        if file and file.filename:
            s3_url = upload_file_to_s3(file, S3_BUCKET_NAME)
            if s3_url:
                model.car_image_url = s3_url

class CosmeticSetView(ModelView):
    column_list = ('car', 'set_name')
    column_labels = {
        'car': '적용 차량', 
        'set_name': '외형 세트 이름', 
        'set_effects': '세트 효과',
        'parts': '구성 부품',
        # Update labels
        'image_url_front': '앞 이미지',
        'image_url_side': '옆 이미지',
        'image_url_rear': '뒤 이미지',
    }
    column_default_sort = 'car'
    
    # Update form overrides for three images
    form_overrides = {
        'image_url_front': FileField,
        'image_url_side': FileField,
        'image_url_rear': FileField,
    }

    def on_model_change(self, form, model, is_created):
        # Update dictionary for three files
        files_to_upload = {
            'image_url_front': 'image_url_front',
            'image_url_side': 'image_url_side',
            'image_url_rear': 'image_url_rear',
        }
        for form_field_name, model_field_name in files_to_upload.items():
            file = form[form_field_name].data
            if file and file.filename:
                unique_filename = f"{model.car.name}_{model.set_name}_{form_field_name}_{secure_filename(file.filename)}"
                s3_url = upload_file_to_s3(file, S3_BUCKET_NAME, unique_filename)
                if s3_url:
                    setattr(model, model_field_name, s3_url)

admin.add_view(CarView(Car, name='차량'))
admin.add_view(CosmeticSetView(CosmeticSet, name='외형 세트'))

# (The rest of the file remains the same)
# --- Public API Endpoints ---
@app.route("/api/cars", methods=['GET'])
def get_cars():
    cars = Car.objects().to_json()
    return cars, 200, {'Content-Type': 'application/json'}

@app.route("/api/cosmetic_sets/<car_id>", methods=['GET'])
def get_cosmetic_sets(car_id):
    sets = CosmeticSet.objects(car=car_id).to_json()
    return sets, 200, {'Content-Type': 'application/json'}

# --- Main Index and Run ---
@app.route("/")
def index():
    return "Car Cosmetics API is running! Go to /admin to manage data."

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)