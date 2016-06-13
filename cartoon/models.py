from __future__ import unicode_literals

from django.db import models

# Create your models here.
class Cartoon(models.Model):
	ct_id  = models.IntegerField()
	username = models.CharField(max_length=50)

	def __unicode__(self):
		return '%s' % (self.ct_id)


class Scene(models.Model):
	sc_id = models.AutoField
	ct_id = models.ForeignKey(Cartoon, related_name='ct_fks')
	ct_contents = models.ImageField(upload_to='media/')

	def __unicode__(self):
		return '%s' % (self.sc_id)