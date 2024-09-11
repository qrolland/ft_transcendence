from django import forms


class UploadFileForm(forms.Form):
    title = forms.CharField(max_length=200)
    file = forms.FileField()

class UsernameChangeForm(forms.Form):
    username = forms.CharField(max_length=100)

# class AvatarChangeForm(forms.Form):
#     selected_avatar = forms.ImageField()

# class TTTForm(forms.Form):
#     new_games_played_ttt = forms.IntegerField()
    
# class AddFriendForm(forms.Form):
#     username = forms.CharField(max_length=100)