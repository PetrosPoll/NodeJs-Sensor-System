# Sensor - System - Logic
A Sensor system logic for an Admin

Imagine that you have a system with some sensors.

>You can do whatever has been setted with sensors but also you want to know what is going on with your sensors. Who is able to change sensor's data and who can change the limits.

With this NodeJs app a user can do the following.

>User can ask for sensor’s data with a simple request (endpoint /data) and get back all sensors for the parameters he gave. The parameters are SensorId - low time - high time. If user give some range time, he will get back some sensors as results for the period of time.

>There is an another endpoint /puSensorData where user can change the data of a sensor. He can change low time and high time.
If user try to change data for a sensor who not exist, automatically it will createed a new sensor with given values.

>Also if user change the value of time smaller from 20 or higher than 30 an email will send to admin and it will inform him about this change.

That was simple managment app for your sensors.
