using API.Helpers;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [ServiceFilter(typeof(LoginActionFilter))]
    public class BaseApiController: ControllerBase
    {
        
    }
}