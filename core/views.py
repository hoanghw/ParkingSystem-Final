# Create your views here.
__author__ = 'Hoang'

from django.http import HttpResponse, HttpResponseRedirect, HttpResponseForbidden
from django.shortcuts import render_to_response
from django.template import RequestContext
from core.models import HistoryTransaction, CurrentTransaction, Participant, FavoriteGarage, LicensePlate
from django.views.decorators.csrf import csrf_exempt
import datetime, time

import simplejson

ACCESS = 'Access-Control-Allow-Origin'
ALLOW = '*'
PER_DAY = 1
PER_HOUR = 2
PER_QUARTER = 3


def _verify_user(username,password):
    u = Participant.objects.filter(username=username)
    return u and u[0].password == password


def _check_out(username):
    u = Participant.objects.filter(username=username)
    if u:
        c = CurrentTransaction.objects.filter(pointer__participant=u[0])
        if c:
            h = c[0].pointer
            #currentTime = datetime.datetime.now()
            #h.endTime = currentTime.strftime('%s')
            h.endTime = int(time.time())
            h.save()
            c[0].delete()


def _calculate_end_time(timestamp, duration, granularity):
    current_time = datetime.datetime.fromtimestamp(timestamp)
    if granularity == PER_DAY:
        current_time = current_time.replace(hour=23)
        current_time = current_time.replace(minute=59)
        current_time = current_time.replace(second=59)
    elif granularity == PER_HOUR:
        current_time += datetime.timedelta(hours=duration)
    return time.mktime(current_time.timetuple())


def check_in(request):
    message = {}
    if request.method == 'GET' and 'data' in request.GET:
        message['isSuccessful'] = False
        json = simplejson.loads(request.GET['data'])
        u = Participant.objects.filter(username=json['username'])
        if u:
            timestamp = int(time.time())
            garage = json['garage']
            granularity = json['granularity']
            duration = json['duration']
            rate = json['rate']
            total_cost = json['totalCost']
            order_number = json['orderNumber']
            space = json['space']
            if space == 0:
                space = "N/A"

            c = CurrentTransaction.objects.filter(pointer__participant=u[0])
            if c:
                extend = c.filter(pointer__garage=garage)
                if extend and extend[0].pointer.granularity == str(PER_HOUR):
                    timestamp = extend[0].pointer.end_time

                _check_out(json['username'])

            end_time = _calculate_end_time(timestamp, duration, granularity)

            h = HistoryTransaction.objects.create(participant=u[0],
                                                  garage=garage,
                                                  space=str(space),
                                                  start_time=timestamp,
                                                  end_time=end_time,
                                                  rate=rate,
                                                  total_cost=total_cost,
                                                  granularity=granularity,
                                                  payment='pending',
                                                  order_number=order_number)
            h.save()
            c = CurrentTransaction.objects.create(pointer=h)
            c.save()
            message['isSuccessful'] = True
            message['endTime'] = end_time
    res = HttpResponse(simplejson.dumps(message), mimetype='application/json')
    res[ACCESS] = ALLOW
    return res


def check_out(request):
    message = {}
    if request.method == 'GET' and 'username' in request.GET:
        _check_out(request.GET['username'])
    return HttpResponse(simplejson.dumps(message), mimetype='application/json')


def get_rate(request):
    message = {'magnitude': 7, 'granularity': PER_DAY}

    #Quick hack
    if request.method == 'GET' and 'data' in request.GET:
        json = simplejson.loads(request.GET['data'])
        u = Participant.objects.filter(username=json['username'])
        if u:
            message['token'] = u[0].cc_token
            f = FavoriteGarage.objects.filter(participant=u[0], garage_name=json['garage'])
            if f:
                message['isFavorite'] = True
            else:
                message['isFavorite'] = False

    res = HttpResponse(simplejson.dumps(message), mimetype='application/json')
    res[ACCESS] = ALLOW
    return res


def change_billing(request):
    return HttpResponse('success')


def sign_in(request):
    message = {}
    # if request.method == 'GET' and 'username' in request.GET and 'password' in request.GET:
    #     if not Participant.objects.filter(username=request.GET['username']):
    #         u = Participant.objects.create(username=request.GET['username'], uid=7777)
    #         u.save()
    #     message['user'] = True
    # else:
    #     message['user'] = False
    if request.method == 'GET' and 'username' in request.GET and 'password' in request.GET:
        u = Participant.objects.filter(username=request.GET['username'])
        if u and u[0].password == request.GET['password']:
            message['user'] = True
        else:
            message['user'] = False
    res = HttpResponse(simplejson.dumps(message), mimetype='application/json')
    res[ACCESS] = ALLOW
    return res


def log_in(request):
    return render_to_response('main/login.html', context_instance=RequestContext(request))


def profile(request):
    return render_to_response('main/profile.html', context_instance=RequestContext(request))


def parking_history(request):
    if request.method == 'POST':
        u = Participant.objects.filter(username=request.POST.get('username', ''))
        if u:
            h = HistoryTransaction.objects.filter(participant=u[0])
            return render_to_response('main/history.html', {'history': h}, context_instance=RequestContext(request))
            #return HttpResponseRedirect('/ulogin')

    return render_to_response('main/profile.html', context_instance=RequestContext(request))


@csrf_exempt
def receipt(request):
    if request.method =='POST' and request.POST['orderPage_transactionType'] == "subscription_authorization":
        user = request.POST.get('merchantDefinedData2')
        payment_type = request.POST.get('merchantDefinedData1')
        order_number = request.POST.get('orderNumber')
        if user and payment_type and order_number:
            h = HistoryTransaction.objects.filter(participant__username= user,
                                                  order_number=order_number)
            if h:
                if payment_type == 'cctoken':
                    h[0].payment = 'Paid by credit card on '
                if payment_type == 'wwtoken':
                    h[0].payment = 'Paid by wagework card on '
                h[0].payment += datetime.datetime.now().strftime("%m-%d-%y %H:%M")
                h[0].save()
        return render_to_response('main/profile.html',context_instance=RequestContext(request))

    if request.method == 'POST' and 'merchantDefinedData2' in request.POST:
        user = request.POST['merchantDefinedData2']
        u = Participant.objects.filter(username=user)
        if u:
            if request.POST['merchantDefinedData1'] == 'wwtoken':
                u[0].ww_token = request.POST['paySubscriptionCreateReply_subscriptionID']
            elif request.POST['merchantDefinedData1'] == 'cctoken':
                u[0].cc_token = request.POST['paySubscriptionCreateReply_subscriptionID']
            u[0].save()
            return render_to_response('main/login.html', context_instance=RequestContext(request))

    return HttpResponseRedirect('/uregistration/')


def get_status(request):
    message = {}
    if request.method == 'GET' and 'data' in request.GET:
        json = simplejson.loads(request.GET['data'])
        u = Participant.objects.filter(username=json['username'])
        if u:
            message['token'] = u[0].cc_token
            message['favorite'] = [i.garage_name for i in u[0].favoritegarage_set.all()]
            lps = u[0].licenseplate_set.filter(is_active=True);
            if lps:
                message['lp'] = lps[0].text
            message['isParking'] = {}
            c = CurrentTransaction.objects.filter(pointer__participant=u[0])
            if c:
                if c[0].pointer.end_time > time.time():
                    message['isParking']['garage'] = c[0].pointer.garage
                    message['isParking']['endTime'] = c[0].pointer.end_time
                    message['isParking']['rate'] = c[0].pointer.rate
                else:
                    for i in c:
                        i.delete()
            message['error'] = False
        else:
            message['error'] = True
    res = HttpResponse(simplejson.dumps(message), mimetype='application/json')
    res[ACCESS] = ALLOW
    return res


def update_favorite(request):
    message = {}
    if request.method == 'GET' and 'data' in request.GET:
        json = simplejson.loads(request.GET['data'])
        u = Participant.objects.filter(username=json['username'])
    if u:
        if json['isFavorite']:
            f = FavoriteGarage.objects.create(participant=u[0], garage_name=json['garage'])
            f.save()
        else:
            f = FavoriteGarage.objects.filter(participant=u[0], garage_name=json['garage'])
            if f:
                for i in f:
                    i.delete()

    res = HttpResponse(simplejson.dumps(message), mimetype='application/json')
    res[ACCESS] = ALLOW
    return res


def registration(request):
    return render_to_response('main/registration.html', context_instance=RequestContext(request))


def verify_registration(request):
    error = {}
    has_error = False

    if request.method == 'GET':
        un = request.GET.get('username', '')
        pw1 = request.GET.get('password1', '')
        pw2 = request.GET.get('password2', '')

        if not un:
            has_error = True
            error['unEmpty'] = "Please enter a username"
        if not pw1 or not pw2:
            has_error = True
            error['pwEmpty'] = "Please enter valid password"
        if pw1 != pw2:
            has_error = True
            error['pwMismatch'] = "Please verify password again"

        u = Participant.objects.filter(username=un)
        if u:
            has_error = True
            error['usernameTaken'] = "This username is already taken"

        if not request.GET.get('licensePlate', ''):
            has_error = True
            error['lpEmpty'] = "Please enter your license plate"

        if not request.GET.get('permit',''):
            has_error = True
            error['pmEmpty'] = "Please select a permit"

        if has_error:
            error['error'] = True
            return HttpResponse(simplejson.dumps(error), mimetype='application/json')
        else:
            u = Participant.objects.create(username=un, uid=6677)
            u.password = pw1
            u.first_name = request.GET.get('firstName','')
            u.last_name = request.GET.get('lastName','')
            u.email = request.GET.get('email','')
            u.permit = request.GET.get('permit','')
            u.save()
            l = LicensePlate.objects.create(text=request.GET.get('licensePlate',''), participant= u, is_active=True, timestamp = time.time())
            l.save()
            error['error'] = False
            return HttpResponse(simplejson.dumps(error), mimetype='application/json')

    return HttpResponse(simplejson.dumps(error), mimetype='application/json')


def edit(request):
    return render_to_response('main/edit.html', context_instance=RequestContext(request))


def change_lp(request):
    message = {}
    if request.method == 'GET' and 'data' in request.GET:
        json = simplejson.loads(request.GET['data'])
        u = Participant.objects.filter(username=json['username'])
        if u:
            lps = u[0].licenseplate_set.all()
            for i in lps:
                i.is_active = False;
            lp = LicensePlate.objects.create(participant=u[0],text=json['newlp'],is_active=True,timestamp=time.time())
            lp.save()
            message['status'] = "success"
        else:
            message['status'] = "no user"
    else:
        message['status'] = "wrong request"
    return HttpResponse(simplejson.dumps(message), mimetype='application/json')

def current(request):
    c = []
    pointers = CurrentTransaction.objects.all()
    for p in pointers:
        h = HistoryTransaction.objects.get(id = p.pointer.id)
        if h.end_time > time.time():
            c.append(h)
        else:
            p.delete()
            p.save()
    return render_to_response('main/current.html', {'current': c}, context_instance=RequestContext(request))
