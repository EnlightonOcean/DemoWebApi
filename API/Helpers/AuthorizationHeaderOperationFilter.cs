using Microsoft.AspNetCore.Authorization;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace API.Helpers
{
    public class AuthorizationHeaderOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            // if (operation.Parameters == null) operation.Parameters = new List<OpenApiParameter>();
            // operation.Parameters.Add( new OpenApiParameter{
            //     Name = "Authorization",
            //     In = ParameterLocation.Header,
            //     Description = "Authorization Header",
            //     Required =false,
            //     Schema = new OpenApiSchema
            //     {
            //         Type = "String"
            //     }
            // });


            // var authAttributes = context.MethodInfo
            //  .GetCustomAttributes(true)
            //  .OfType<AuthorizeAttribute>()
            //  .Distinct();

            // if (authAttributes.Any())
            // {

            //     operation.Responses.TryAdd("401", new OpenApiResponse { Description = "Unauthorized" });
            //     operation.Responses.TryAdd("403", new OpenApiResponse { Description = "Forbidden" });

            //     var jwtbearerScheme = new OpenApiSecurityScheme
            //     {
            //         Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "bearer" }
            //     };

            //     operation.Security = new List<OpenApiSecurityRequirement>
            //     {
            //         new OpenApiSecurityRequirement
            //         {
            //             [ jwtbearerScheme ] = new string [] { }
            //         }
            //     };
            // }
            var authAttributes = context.MethodInfo
            .GetCustomAttributes(true)
            .OfType<AuthorizeAttribute>()
            .Distinct();

            if (authAttributes.Any())
            {
                if (operation.Parameters == null)
                    operation.Parameters = new List<OpenApiParameter>();

                operation.Parameters.Add(new OpenApiParameter
                {
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Description = "JWT access token",
                    Required = true,
                    Schema = new OpenApiSchema
                    {
                        Type = "String"
                    }
                });

                operation.Responses.Add("401", new OpenApiResponse { Description = "Unauthorized" });
                operation.Responses.Add("403", new OpenApiResponse { Description = "Forbidden" });

                //Add JWT bearer type
                var jwtbearerScheme = new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "bearer" }
                };
                operation.Security = new List<OpenApiSecurityRequirement>
                {
                    new OpenApiSecurityRequirement
                    {
                        [ jwtbearerScheme ] = new string [] { }
                    }
                };

            }
        }
    }
}