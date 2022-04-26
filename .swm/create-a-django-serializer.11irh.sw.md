---
id: 11irh
name: Create a Django Serializer
file_version: 1.0.2
app_version: 0.8.2-0
file_blobs:
  src/sentry/api/endpoints/assistant.py: 8d973e7b452a8253d238e5f87bdbfe3bc6245459
  src/sentry/api/endpoints/api_tokens.py: ee8354987672b97ef675935cc17f20659c6c08de
---

Django Rest Framework's serializers are used to handle input validation and transformation for data coming into Sentry.

<br/>

In the typical serializer, the fields are specified so that they validate the type and format of the data to your specifications. Django Rest Framework serializers can also save the information into the database if written to fit to the model.

To create a Django Rest Framework's serializer, inherit from `serializers.Serializer`[<sup id="2neiGO">↓</sup>](#f-2neiGO) .
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 src/sentry/api/endpoints/assistant.py
```python
⬜ 16     VALID_STATUSES = frozenset(("viewed", "dismissed"))
⬜ 17     
⬜ 18     
🟩 19     class AssistantSerializer(serializers.Serializer):
🟩 20         guide = serializers.CharField(required=False)
🟩 21         guide_id = serializers.IntegerField(required=False)
🟩 22         status = serializers.ChoiceField(choices=zip(VALID_STATUSES, VALID_STATUSES))
🟩 23         useful = serializers.BooleanField(required=False)
⬜ 24     
⬜ 25         def validate_guide_id(self, value):
⬜ 26             valid_ids = manager.get_valid_ids()
```

<br/>

**Field Checking**

In the above example the serializer will accept and validate json containing the fields `guide`[<sup id="1jWbot">↓</sup>](#f-1jWbot) , `guide_id`[<sup id="Z22JlgL">↓</sup>](#f-Z22JlgL) , `status`[<sup id="ZxGNmk">↓</sup>](#f-ZxGNmk) and `useful`[<sup id="Z2sPz6l">↓</sup>](#f-Z2sPz6l) . It will also verify that `guide`[<sup id="1jWbot">↓</sup>](#f-1jWbot) is of type `CharField`[<sup id="1yQWVg">↓</sup>](#f-1yQWVg) , and `guide_id`[<sup id="Z22JlgL">↓</sup>](#f-Z22JlgL) is an `IntegerField`[<sup id="Z1xUsfi">↓</sup>](#f-Z1xUsfi) and so on.

By default, fields are required, and if not supplied will be marked as invalid by the serializer. Note that for the fields `guide`[<sup id="1jWbot">↓</sup>](#f-1jWbot) , `guide_id`[<sup id="Z22JlgL">↓</sup>](#f-Z22JlgL) and `useful`[<sup id="Z2sPz6l">↓</sup>](#f-Z2sPz6l) , `required`[<sup id="1W3QWH">↓</sup>](#f-1W3QWH) is set to `False`[<sup id="Z2hArRW">↓</sup>](#f-Z2hArRW) . And so, these fields may not be included and the serializer would still be considered valid.

<br/>

**Custom Validation**

For values that need custom validation (in addition to simple type checking), a `validate_` function can be created, for example, `validate_guide_id`[<sup id="Z2iV8bS">↓</sup>](#f-Z2iV8bS) , and notice that the name matches the **exact** variable name as the field is given ( `guide_id`[<sup id="Z22JlgL">↓</sup>](#f-Z22JlgL) ).

If a field does not match what your validate method is expecting raise a `serializers.ValidationError`[<sup id="1N10gV">↓</sup>](#f-1N10gV) .
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 src/sentry/api/endpoints/assistant.py
```python
⬜ 22         status = serializers.ChoiceField(choices=zip(VALID_STATUSES, VALID_STATUSES))
⬜ 23         useful = serializers.BooleanField(required=False)
⬜ 24     
🟩 25         def validate_guide_id(self, value):
🟩 26             valid_ids = manager.get_valid_ids()
🟩 27             if value not in valid_ids:
🟩 28                 raise serializers.ValidationError("Not a valid assistant guide_id")
🟩 29             return value
⬜ 30     
⬜ 31         def validate(self, attrs):
⬜ 32             attrs = super().validate(attrs)
```

<br/>

### Usage

In an endpoint, this is a typical use of a Django Rest Framework Serializer:
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 src/sentry/api/endpoints/api_tokens.py
```python
⬜ 28     
⬜ 29             return Response(serialize(token_list, request.user))
⬜ 30     
🟩 31         def post(self, request: Request) -> Response:
🟩 32             serializer = ApiTokenSerializer(data=request.data)
🟩 33     
🟩 34             if serializer.is_valid():
🟩 35                 result = serializer.validated_data
🟩 36     
🟩 37                 token = ApiToken.objects.create(
🟩 38                     user=request.user, scope_list=result["scopes"], refresh_token=None, expires_at=None
🟩 39                 )
🟩 40     
🟩 41                 capture_security_activity(
🟩 42                     account=request.user,
🟩 43                     type="api-token-generated",
🟩 44                     actor=request.user,
🟩 45                     ip_address=request.META["REMOTE_ADDR"],
🟩 46                     context={},
🟩 47                     send_email=True,
🟩 48                 )
🟩 49     
🟩 50                 return Response(serialize(token, request.user), status=201)
🟩 51             return Response(serializer.errors, status=400)
🟩 52     
⬜ 53         def delete(self, request: Request):
⬜ 54             token = request.data.get("token")
⬜ 55             if not token:
```

<br/>

**Validating Data**

The Serializer from the Django Rest Framework will be used in methods with incoming data (i.e. `put` and `post` methods) that need to be validated. Once the serializer is instantiated, you can call `serializer.is_valid`[<sup id="iJd6r">↓</sup>](#f-iJd6r) to validate the data. `serializer.errors` will give feedback on specifically what was invalid about the data given.

<br/>

<!-- THIS IS AN AUTOGENERATED SECTION. DO NOT EDIT THIS SECTION DIRECTLY -->
### Swimm Note

<span id="f-1yQWVg">CharField</span>[^](#1yQWVg) - "src/sentry/api/endpoints/assistant.py" L20
```python
    guide = serializers.CharField(required=False)
```

<span id="f-Z2hArRW">False</span>[^](#Z2hArRW) - "src/sentry/api/endpoints/assistant.py" L20
```python
    guide = serializers.CharField(required=False)
```

<span id="f-1jWbot">guide</span>[^](#1jWbot) - "src/sentry/api/endpoints/assistant.py" L20
```python
    guide = serializers.CharField(required=False)
```

<span id="f-Z22JlgL">guide_id</span>[^](#Z22JlgL) - "src/sentry/api/endpoints/assistant.py" L21
```python
    guide_id = serializers.IntegerField(required=False)
```

<span id="f-Z1xUsfi">IntegerField</span>[^](#Z1xUsfi) - "src/sentry/api/endpoints/assistant.py" L21
```python
    guide_id = serializers.IntegerField(required=False)
```

<span id="f-1W3QWH">required</span>[^](#1W3QWH) - "src/sentry/api/endpoints/assistant.py" L20
```python
    guide = serializers.CharField(required=False)
```

<span id="f-iJd6r">serializer.is_valid</span>[^](#iJd6r) - "src/sentry/api/endpoints/api_tokens.py" L34
```python
        if serializer.is_valid():
```

<span id="f-2neiGO">serializers.Serializer</span>[^](#2neiGO) - "src/sentry/api/endpoints/assistant.py" L19
```python
class AssistantSerializer(serializers.Serializer):
```

<span id="f-1N10gV">serializers.ValidationError</span>[^](#1N10gV) - "src/sentry/api/endpoints/assistant.py" L28
```python
            raise serializers.ValidationError("Not a valid assistant guide_id")
```

<span id="f-ZxGNmk">status</span>[^](#ZxGNmk) - "src/sentry/api/endpoints/assistant.py" L22
```python
    status = serializers.ChoiceField(choices=zip(VALID_STATUSES, VALID_STATUSES))
```

<span id="f-Z2sPz6l">useful</span>[^](#Z2sPz6l) - "src/sentry/api/endpoints/assistant.py" L23
```python
    useful = serializers.BooleanField(required=False)
```

<span id="f-Z2iV8bS">validate_guide_id</span>[^](#Z2iV8bS) - "src/sentry/api/endpoints/assistant.py" L25
```python
    def validate_guide_id(self, value):
```

<br/>

This file was generated by Swimm. [Click here to view it in the app](https://app.swimm.io/repos/Z2l0aHViJTNBJTNBc2VudHJ5JTNBJTNBc3dpbW1pbw==/docs/11irh).