FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# نسخ ملفات المشاريع أولاً لتسريع الاستعادة
COPY ContractMind.API/ContractMind.API.csproj ContractMind.API/
COPY ContractMind.BLL/ContractMind.BLL.csproj ContractMind.BLL/
COPY ContractMind.DAL/ContractMind.DAL.csproj ContractMind.DAL/
COPY ContractMindModal/ContractMindModel.csproj ContractMindModal/
RUN dotnet restore ContractMind.API/ContractMind.API.csproj

# نسخ بقية الكود ثم النشر
COPY . .
RUN dotnet publish ContractMind.API/ContractMind.API.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "ContractMind.API.dll"]