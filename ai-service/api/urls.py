from django.urls import path
from . import views

urlpatterns = [
    # 1. Venues Directory Endpoint
    path('venues', views.venues_list, name='venues_list'),
    
    # 2. Bookings CRUD Endpoints
    path('bookings', views.bookings_list, name='bookings_list'),
    path('bookings/<str:booking_id>', views.booking_detail, name='booking_detail'),
    
    # 3. Players Matchmaking Profiles Endpoints
    path('players', views.players_list, name='players_list'),
    
    # 4. Clubs & Teams Roster Endpoints
    path('teams', views.teams_list, name='teams_list'),
    
    # 5. Player-to-Player Connection Invites Endpoints
    path('connects', views.connects_list, name='connects_list'),
    
    # 6. Team Joining Roster Requests Endpoints
    path('joins', views.joins_list, name='joins_list'),
    
    # 7. Team Match Challenges Endpoints
    path('matches', views.matches_list, name='matches_list'),
    
    # 8. Chat Message Threads Endpoints
    path('threads', views.threads_list, name='threads_list'),

    # 9. User Authentication Endpoints
    path('auth/signup', views.auth_signup, name='auth_signup'),
    path('auth/login', views.auth_login, name='auth_login'),
]
