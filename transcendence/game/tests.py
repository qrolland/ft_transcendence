# from django.test import TestCase

# Create your tests here.



def get_nearest_power_2(nb_user):
	power = 2
	while(1 and power < 1024):
		if power * 2 >= nb_user:
			return power
		power *= 2


def get_nb_match(nearest_power, remainder):
	nb_match = 0
	while(nearest_power >= 2):
		nb_match += nearest_power / 2
		nearest_power = nearest_power / 2
	
	nb_match += int (remainder / 2)
	return nb_match

def set_up_tournament(user):
	nb_user = user
	nearest_power = get_nearest_power_2(nb_user)
	remainder = nb_user - nearest_power
	nb_match = get_nb_match(nearest_power, remainder)
	return nb_match


if __name__ == '__main__':
	nb_match = set_up_tournament(6)
	print (f"6 player :{nb_match} match")
	if nb_match != 4:
		print("ERROR")

	
	nb_match = set_up_tournament(13)
	print (f"13 player :{nb_match} match")
	if nb_match != 4:
		print("ERROR")

