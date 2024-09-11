import os
from django import template

register = template.Library()


@register.simple_tag
def get_env_var(key):
	return os.environ.get(key)

@register.filter
def keyvalue(dictionary, key):
    return dictionary.get(key)