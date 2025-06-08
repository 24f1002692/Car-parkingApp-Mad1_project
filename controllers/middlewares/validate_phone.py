import phonenumbers
import pycountry
from phonenumbers.data import _COUNTRY_CODE_TO_REGION_CODE
from phonenumbers import parse, is_valid_number, region_code_for_number, number_type, PhoneNumberType
from phonenumbers.phonenumberutil import NumberParseException

def validate_phoneNumber(phone):
    try:
        region_code = "IN"
        expected_country_code = 91

        parsed = parse(phone, None)
        print('Parsed:', parsed)

        if not is_valid_number(parsed):
            print('Invalid number structure')
            return False

        if parsed.country_code != expected_country_code:
            print('Incorrect country code')
            return False

        if region_code_for_number(parsed) != region_code:
            print('Region mismatch')
            return False

        if number_type(parsed) != PhoneNumberType.MOBILE:
            print('Not a mobile number')
            return False

        return True

    except NumberParseException as e:
        print("Parse error:", e)
        return False

