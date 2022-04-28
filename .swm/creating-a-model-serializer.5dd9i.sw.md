---
id: 5dd9i
name: Creating a Model Serializer
file_version: 1.0.2
app_version: 0.8.2-0
file_blobs:
  src/sentry/incidents/logic.py: 3b783f85380afac09f108676aba1f2240c4e5a28
  src/sentry/api/serializers/models/alert_rule_trigger_action.py: 1f2fedc2dc96208a4d055671d16fef7de0b9496a
  src/sentry/api/serializers/models/organization_member/expand/teams.py: fd024771304fc26011c974ce475e2ab829b59157
  src/sentry/api/serializers/base.py: a2148202429f2a06d0138c015b3201e7564d62f2
  src/sentry/api/serializers/models/group.py: 9f63319c44965f2a2440fff3a8da97dcef869dad
---

This document covers how to create a new Model Serializer.

A Model Serializer is a home-grown version of Serializers, used only for outgoing data.

Some examples of `Serializer`[<sup id="1Aq57B">↓</sup>](#f-1Aq57B)s are `AlertRuleTriggerActionSerializer`[<sup id="2iiHPl">↓</sup>](#f-2iiHPl), `StreamGroupSerializerSnuba`[<sup id="15zLgw">↓</sup>](#f-15zLgw), and `OrganizationMemberWithTeamsSerializer`[<sup id="12RSvr">↓</sup>](#f-12RSvr). Note: some of these examples inherit indirectly from `Serializer`[<sup id="1Aq57B">↓</sup>](#f-1Aq57B).

<br/>

## TL;DR - How to Add a `Serializer`[<sup id="1Aq57B">↓</sup>](#f-1Aq57B)

1. Create a new class inheriting from `Serializer`[<sup id="1Aq57B">↓</sup>](#f-1Aq57B)&nbsp;
   - Place the file in one of the directories under [[sym:./src/sentry({"type":"path","text":"src/sentry","path":"src/sentry"})]],
     e.g. `AlertRuleTriggerActionSerializer`[<sup id="2iiHPl">↓</sup>](#f-2iiHPl) is defined in [[sym:./src/sentry/api/serializers/models/alert_rule_trigger_action.py({"type":"path","text":"src/sentry/api/serializers/models/alert_rule_trigger_action.py","path":"src/sentry/api/serializers/models/alert_rule_trigger_action.py"})]].
2. Implement `serialize`[<sup id="ZpMg6k">↓</sup>](#f-ZpMg6k).
4. **Profit** 💰

<br/>

## The Full Story

We'll follow the implementation of `AlertRuleTriggerActionSerializer`[<sup id="2iiHPl">↓</sup>](#f-2iiHPl) for this example.

<br/>

### `AlertRuleTriggerActionSerializer`[<sup id="2iiHPl">↓</sup>](#f-2iiHPl) Usage Example

For example, this is how `AlertRuleTriggerActionSerializer`[<sup id="2iiHPl">↓</sup>](#f-2iiHPl) can be used.

We initialize it with the data we want to validate, here `action`[<sup id="Z1kcn27">↓</sup>](#f-Z1kcn27) , and use `is_valid`[<sup id="1AC06z">↓</sup>](#f-1AC06z) to do the validation.
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 src/sentry/incidents/logic.py
```python
⬜ 1390           for trigger in data["triggers"]:
⬜ 1391               for action in trigger["actions"]:
⬜ 1392                   action = rewrite_trigger_action_fields(action)
🟩 1393                   a_s = AlertRuleTriggerActionSerializer(
🟩 1394                       context={
🟩 1395                           "organization": organization,
🟩 1396                           "access": SystemAccess(),
🟩 1397                           "user": user,
🟩 1398                           "input_channel_id": action.get("inputChannelId"),
🟩 1399                       },
🟩 1400                       data=action,
🟩 1401                   )
🟩 1402                   if a_s.is_valid():
⬜ 1403                       if (
⬜ 1404                           a_s.validated_data["type"].value == AlertRuleTriggerAction.Type.SLACK.value
⬜ 1405                           and not a_s.validated_data["input_channel_id"]
```

<br/>

## Steps to Adding a new Serializer

<br/>

### 1\. Inherit from `Serializer`[<sup id="1Aq57B">↓</sup>](#f-1Aq57B).
All `Serializer`[<sup id="1Aq57B">↓</sup>](#f-1Aq57B)s are defined under [[sym:./src/sentry({"type":"path","text":"src/sentry","path":"src/sentry"})]].

<br/>

We first need to define our class in the relevant file, and inherit from `Serializer`[<sup id="1Aq57B">↓</sup>](#f-1Aq57B). We also need the `register`[<sup id="Z25Fbkk">↓</sup>](#f-Z25Fbkk) decorator:
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 src/sentry/api/serializers/models/alert_rule_trigger_action.py
```python
⬜ 2      from sentry.incidents.models import AlertRuleTriggerAction
⬜ 3      
⬜ 4      
🟩 5      @register(AlertRuleTriggerAction)
🟩 6      class AlertRuleTriggerActionSerializer(Serializer):
⬜ 7          def human_desc(self, action):
⬜ 8              # Returns a human readable description to display in the UI
⬜ 9              if action.type == action.Type.EMAIL.value:
```

<br/>

> **Note**: the class name should end with "Serializer".

<br/>

### 2\. Implement serialize

<br/>

For example, in `AlertRuleTriggerActionSerializer`[<sup id="2iiHPl">↓</sup>](#f-2iiHPl):
<!-- NOTE-swimm-snippet: the lines below link your snippet to Swimm -->
### 📄 src/sentry/api/serializers/models/alert_rule_trigger_action.py
```python
⬜ 39             """
⬜ 40             return action.target_identifier if action.type == action.Type.SLACK.value else None
⬜ 41     
🟩 42         def serialize(self, obj, attrs, user, **kwargs):
🟩 43             from sentry.incidents.serializers import ACTION_TARGET_TYPE_TO_STRING
🟩 44     
🟩 45             result = {
🟩 46                 "id": str(obj.id),
🟩 47                 "alertRuleTriggerId": str(obj.alert_rule_trigger_id),
🟩 48                 "type": AlertRuleTriggerAction.get_registered_type(
🟩 49                     AlertRuleTriggerAction.Type(obj.type)
🟩 50                 ).slug,
🟩 51                 "targetType": ACTION_TARGET_TYPE_TO_STRING[
🟩 52                     AlertRuleTriggerAction.TargetType(obj.target_type)
🟩 53                 ],
🟩 54                 "targetIdentifier": self.get_identifier_from_action(obj),
🟩 55                 "inputChannelId": self.get_input_channel_id(obj),
🟩 56                 "integrationId": obj.integration_id,
🟩 57                 "sentryAppId": obj.sentry_app_id,
🟩 58                 "dateCreated": obj.date_added,
🟩 59                 "desc": self.human_desc(obj),
🟩 60             }
🟩 61     
🟩 62             # Check if action is a Sentry App that has Alert Rule UI Component settings
🟩 63             if obj.sentry_app_id and obj.sentry_app_config:
🟩 64                 result["settings"] = obj.sentry_app_config
🟩 65     
🟩 66             return result
⬜ 67     
```

<br/>

<!-- THIS IS AN AUTOGENERATED SECTION. DO NOT EDIT THIS SECTION DIRECTLY -->
### Swimm Note

<span id="f-Z1kcn27">action</span>[^](#Z1kcn27) - "src/sentry/incidents/logic.py" L1400
```python
                    data=action,
```

<span id="f-2iiHPl">AlertRuleTriggerActionSerializer</span>[^](#2iiHPl) - "src/sentry/api/serializers/models/alert_rule_trigger_action.py" L6
```python
class AlertRuleTriggerActionSerializer(Serializer):
```

<span id="f-1AC06z">is_valid</span>[^](#1AC06z) - "src/sentry/incidents/logic.py" L1402
```python
                if a_s.is_valid():
```

<span id="f-12RSvr">OrganizationMemberWithTeamsSerializer</span>[^](#12RSvr) - "src/sentry/api/serializers/models/organization_member/expand/teams.py" L10
```python
class OrganizationMemberWithTeamsSerializer(OrganizationMemberSerializer):
```

<span id="f-Z25Fbkk">register</span>[^](#Z25Fbkk) - "src/sentry/api/serializers/models/alert_rule_trigger_action.py" L5
```python
@register(AlertRuleTriggerAction)
```

<span id="f-ZpMg6k">serialize</span>[^](#ZpMg6k) - "src/sentry/api/serializers/models/alert_rule_trigger_action.py" L42
```python
    def serialize(self, obj, attrs, user, **kwargs):
```

<span id="f-1Aq57B">Serializer</span>[^](#1Aq57B) - "src/sentry/api/serializers/base.py" L88
```python
class Serializer:
```

<span id="f-15zLgw">StreamGroupSerializerSnuba</span>[^](#15zLgw) - "src/sentry/api/serializers/models/group.py" L946
```python
class StreamGroupSerializerSnuba(GroupSerializerSnuba, GroupStatsMixin):
```

<br/>

This file was generated by Swimm. [Click here to view it in the app](https://app.swimm.io/repos/Z2l0aHViJTNBJTNBc2VudHJ5JTNBJTNBc3dpbW1pbw==/docs/5dd9i).