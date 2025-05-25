<h1>🚴 Safe Bluebike Finder 🚴</h1>

Safe Bluebike Finder is a web app that helps you find safe Bluebike stations around Boston. Every Bluebike station around Boston has a safety score calculated based on publicly available data on bike accidents and bike fatalities. After inputting your location, Safe Bluebike Finder shows you all Bluebike stations within a 0.5-mile radius with their corresponding safety scores. By clicking on a station, you can see bike accident and bike fatality data for the area around the station.  

<img src="https://github.com/user-attachments/assets/e1927ce9-23b7-4948-89c0-4786fa30baed" width="600"/>
<img src="https://github.com/user-attachments/assets/7c47f1f1-8866-4a76-93a6-bb825efcab62" width="600"/>
<img src="https://github.com/user-attachments/assets/f75c4357-27fd-46f4-a242-bff6fc7c3ac5" width="600"/>

<h2>Additional Features ✨</h2> 

- View a Google Maps route to your selected station 🗺️
- Detect your current device location 📍
- Show or hide bike lanes on the map 🚴
- Switch between light and dark mode ☀️🌙

<h2>How to Run Safe Bluebike Finder 🚴</h2>
Safe Bluebike Finder requires a Google Maps API key to function. Follow these steps to get started:

- Clone the Safe Bluebike Finder repository.
- Install all dependencies:
```
npm install
```
- In the project root, create a `.env.local` file.
- Add your Google Maps API key to the file in the following format:
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY
```
> Replace `YOUR_API_KEY` with your actual Google Maps API key.
- Now, you can run the development server:
```
npm run dev
```
- Open http://localhost:3000 with your browser to see Safe Bluebike Finder.

<h2>Data Sources 📈</h2>

Our web app uses the following data:

- [Bluebikes Station Data](https://bluebikes.com/system-data): Includes all Bluebike station locations across Boston.
- [Boston Bike Accident Records](https://data.boston.gov/dataset/vision-zero-crash-records): Contains reports of bicycle-related accidents in Boston.
- [Boston Bike Fatality Records](https://data.boston.gov/dataset/vision-zero-fatality-records): Contains reports of bicycle-related fatalities in Boston.


