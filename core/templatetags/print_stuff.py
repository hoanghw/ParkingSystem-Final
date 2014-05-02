from django import template
import datetime
from core.models import HistoryTransaction, LicensePlate, Participant
from django.core.serializers import serialize
from django.db.models.query import QuerySet
import simplejson
register = template.Library()

def print_timestamp(timestamp):
    try:
        #assume, that timestamp is given in seconds with decimal point
        ts = float(timestamp)
    except ValueError:
        return None
    return datetime.datetime.fromtimestamp(ts)

register.filter(print_timestamp)

@register.filter("print_id")
def print_id(id):
    try:
        simple_id = float(id)
    except ValueError:
        return 0
    return int(simple_id/1000)

@register.filter("print_rate")
def print_rate(rate,granularity):
    if granularity == '1':
        new_granularity = '/day'
    elif granularity == '2':
        new_granularity = '/hour'
    new_rate = '$'+'%.2f' % rate
    return new_rate + new_granularity

@register.filter("print_cost")
def print_cost(cost):
    return '$'+'%.2f' % cost

@register.filter("print_lp")
def print_lp(participant_id):
    p = Participant.objects.filter(id=participant_id)
    if p:
        lp = p[0].licenseplate_set.filter(is_active=True)
        if lp:
            return lp[0].text
    return 'None'

@register.filter("jsonify")
def jsonify(object):
    if isinstance(object, QuerySet):
        return serialize('json', object)
    return simplejson.dumps(object)
