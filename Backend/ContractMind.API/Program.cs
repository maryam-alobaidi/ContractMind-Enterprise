

using ContractMind.BLL.Interface;
using ContractMind.BLL.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();



//for use connectionString in DAL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
clsSetting.ConnectionString = connectionString;

// قراءة مفتاح الـ Secret من الـ User Secrets
var jwtSecret = builder.Configuration["JwtSettings:Secret"];
var key = Encoding.UTF8.GetBytes(jwtSecret);

// إضافة خدمة المصادقة باستخدام JWT
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false, // يمكنك تركها false إذا لم تحدد Issuer عند إنشاء التوكن
        ValidateAudience = false, // نفس الشيء للـ Audience
        ValidateLifetime = true // 🌟 مهم جداً: التأكد من أن التوكن لم ينتهي وقته
    };
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200") 
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});


//Add service
builder.Services.AddTransient<IEmailSender, EmailSender>();
builder.Services.AddScoped<IOpenAIService, OpenAIService>();
builder.Services.AddScoped<IPrivacyService, PrivacyService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();

// 1. يجب وضع CORS دائماً قبل المصادقة والتفويض
app.UseCors("AllowAngular");

// 2. تفعيل المصادقة (معرفة من هو المستخدم عبر التوكن)
app.UseAuthentication();

// 3. تفعيل التفويض (معرفة هل يملك صلاحية دخول هذا المسار أم لا)
app.UseAuthorization();

app.MapControllers();

app.Run();