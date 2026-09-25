import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    
    if response is not None:
        error_code = 'api_error'
        if response.status_code == status.HTTP_401_UNAUTHORIZED:
            error_code = 'authentication_error'
        elif response.status_code == status.HTTP_403_FORBIDDEN:
            error_code = 'permission_denied'
        elif response.status_code == status.HTTP_404_NOT_FOUND:
            error_code = 'not_found'
        elif response.status_code == status.HTTP_400_BAD_REQUEST:
            error_code = 'validation_error'
        elif response.status_code == status.HTTP_429_TOO_MANY_REQUESTS:
            error_code = 'rate_limited'

        custom_data = {
            'error': {
                'code': error_code,
                'message': str(exc.detail) if hasattr(exc, 'detail') and isinstance(exc.detail, str) else 'An error occurred processing your request.',
                'details': response.data if isinstance(response.data, (dict, list)) else None
            }
        }
        response.data = custom_data
    else:
        logger.exception("Unhandled server exception: %s", exc)
        response = Response({
            'error': {
                'code': 'internal_server_error',
                'message': 'An internal server error occurred.'
            }
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    return response
