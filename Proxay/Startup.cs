using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Cache;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Net.Http.Headers;

namespace Proxay
{
    public class Startup
    {
        // This method gets called by the runtime. Use this method to add services to the container.
        // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection services)
        {
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
			if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.Run(async (context) =>
            {
				if ( !context.Request.Query.ContainsKey( "url" ) )
					return;

				if ( !Uri.TryCreate( context.Request.Query["url"], UriKind.Absolute, out var uri ) )
					return;
					
				context.Response.Headers[HeaderNames.CacheControl] =
					"public,max-age=" + 60 * 60 * 24 * 365;

				var request = WebRequest.CreateHttp( uri );
				request.CachePolicy = new HttpRequestCachePolicy( HttpCacheAgeControl.MaxAge, TimeSpan.FromDays( 365 ) );

				using ( var response = await request.GetResponseAsync() )
				{
					await response.GetResponseStream().CopyToAsync( context.Response.Body );
				}
            });
        }
    }
}
