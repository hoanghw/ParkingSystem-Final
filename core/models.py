__author__ = 'Hoang'
from django.db import models


class Participant(models.Model):
    uid = models.BigIntegerField()
    username = models.CharField(max_length=100)
    password = models.CharField(max_length=100)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    address = models.CharField(max_length=100)
    email = models.CharField(max_length=100)
    parking_status = models.BooleanField(default=False)
    ww_token = models.CharField(max_length=22, blank=True, null=True)
    cc_token = models.CharField(max_length=22, blank=True, null=True)
    permit = models.CharField(max_length=10)


class LicensePlate(models.Model):
    text = models.CharField(max_length=100)
    participant = models.ForeignKey(Participant)
    is_active = models.BooleanField()
    timestamp = models.BigIntegerField()


class FavoriteGarage(models.Model):
    garage_name = models.CharField(max_length=50)
    participant = models.ForeignKey(Participant)


class HistoryTransaction(models.Model):
    participant = models.ForeignKey(Participant)
    garage = models.CharField(max_length=100)
    space = models.CharField(max_length=4)
    start_time = models.BigIntegerField()
    end_time = models.BigIntegerField()
    total_cost = models.FloatField()
    granularity_choices = ((1,'Per Diem'),(2,'Per Hour'),(3,'Per Quarter'),)
    granularity = models.CharField(max_length=10,choices=granularity_choices,default=1)
    rate = models.FloatField()
    payment = models.CharField(max_length=100)
    order_number = models.CharField(max_length=20)


class CurrentTransaction(models.Model):
    pointer = models.ForeignKey(HistoryTransaction)


class Garage(models.Model):
    garage_name = models.CharField(max_length=50)
    is_f_permit = models.BooleanField()
    is_c_permit = models.BooleanField()
    price_daily = models.FloatField(default=10)
    price_hourly = models.FloatField(default=2)
    price_quarterly = models.FloatField(default=0.5)


