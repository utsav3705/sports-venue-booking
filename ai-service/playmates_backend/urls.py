from django.urls import path, include, re_path
from django.http import JsonResponse
from django.views.generic import TemplateView
from django.views.static import serve
from django.conf import settings
import os

# Root of dist folder in workspace root
DIST_DIR = os.path.join(settings.BASE_DIR.parent, 'dist')

def api_root(request):
    return JsonResponse({
        "name": "PlayMates Ahmedabad API Backend",
        "status": "healthy",
        "version": "1.0.0",
        "endpoints": {
            "venues": "/api/venues",
            "bookings": "/api/bookings",
            "players": "/api/players",
            "teams": "/api/teams",
            "connects": "/api/connects",
            "joins": "/api/joins",
            "matches": "/api/matches",
            "threads": "/api/threads"
        }
    })

urlpatterns = [
    # 1. API root welcome message
    path('api', api_root, name='api_root'),
    
    # 2. Include all API endpoints routes from the 'api' app package
    path('api/', include('api.urls')),

    # 3. Serve Vite built static files (assets, venues, favicon)
    re_path(r'^(?P<path>(assets|venues|favicon\.ico).*)$', serve, {'document_root': DIST_DIR}),

    # 4. Catch-all view rendering React built index.html for frontend SPA routing
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html'), name='react_spa'),
]


