from django.conf.urls import patterns, include, url
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',

    url(r'^$','core.views.profile'),
    # Examples:
    # url(r'^$', 'ParkingSystem_final.views.home', name='home'),
    # url(r'^ParkingSystem_final/', include('ParkingSystem_final.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),

    url(r'^uverifyreg/', 'core.views.verify_registration'),
    url(r'^uregistration/', 'core.views.registration'),

    url(r'^ucheckin/','core.views.check_in'),
    url(r'^ucheckout/','core.views.check_out'),
    url(r'^getrate/','core.views.get_rate'),
    url(r'^changelp/','core.views.change_lp'),
    url(r'^changebilling/','core.views.change_billing'),
    url(r'^verifyuser/','core.views.verify_user'),
    url(r'^ulogin','core.views.log_in'),
    url(r'^uprofile','core.views.profile'),
    url(r'^usignin','core.views.sign_in'),
    url(r'^uhistory','core.views.parking_history'),
    url(r'^receipt','core.views.receipt'),
    url(r'^ugetstatus','core.views.get_status'),
    url(r'^uupdatefav','core.views.update_favorite'),
    url(r'^uedit','core.views.edit'),
    url(r'^current','core.views.current')

)

urlpatterns += staticfiles_urlpatterns()