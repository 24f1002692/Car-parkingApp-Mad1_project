from flask import request, jsonify
from pydantic import ValidationError as PydanticValidationError

def validate_form(schema_class):
    def decorator(func):
        def wrapper(*args, **kwargs):
            if request.is_json:
                data = request.get_json()
            else:
                data = request.form.to_dict()

            try:
                validated_data = schema_class(**data)
                request.validated_data = validated_data    # Store the Pydantic model instance in request
            except PydanticValidationError as err:
                return jsonify({
                    'error': 'Validation failed',
                    'details': err.errors()
                }), 400

            return func(*args, **kwargs)

        wrapper.__name__ = func.__name__
        return wrapper
    return decorator
