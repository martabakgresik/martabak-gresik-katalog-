export async function onRequestPost(context: any) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { destination_lat, destination_lng } = body;

    if (!destination_lat || !destination_lng) {
      return new Response(JSON.stringify({ success: false, message: "Missing destination coordinates" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!env.BITESHIP_API_KEY) {
       console.error("BITESHIP_API_KEY is not set");
       return new Response(JSON.stringify({ success: false, message: "Server configuration error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Titik lokasi toko Martabak Gresik (dari InlineMap.tsx STORE_COORDS)
    const origin_lat = -7.153569932013082;
    const origin_lng = 112.65057337162405;

    // Call Biteship API
    const response = await fetch("https://api.biteship.com/v1/rates/couriers", {
      method: "POST",
      headers: {
        "Authorization": env.BITESHIP_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        origin_latitude: origin_lat,
        origin_longitude: origin_lng,
        destination_latitude: destination_lat,
        destination_longitude: destination_lng,
        couriers: "gojek,grab", // Only instant couriers
        items: [
          {
            name: "Makanan",
            description: "Martabak",
            value: 50000,
            length: 20,
            width: 20,
            height: 10,
            weight: 1000,
            quantity: 1
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Biteship API Error:", data);
      return new Response(JSON.stringify({ success: false, message: data.error || "Failed to fetch rates from aggregator" }), {
        status: 502,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Format response to be frontend friendly
    const availableCouriers = data.pricing?.map((c: any) => ({
      courier_name: c.courier_name,
      courier_service_name: c.courier_service_name,
      price: c.price,
      duration: c.duration,
      company: c.company,
      service_type: c.service_type
    })) || [];

    return new Response(JSON.stringify({ success: true, couriers: availableCouriers }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("API error:", error);
    return new Response(JSON.stringify({ success: false, message: error.message || "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
