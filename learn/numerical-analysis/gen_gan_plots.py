
import json
import random

def generate_heatmap(title, noise_level=1.0):
    # Create a 20x20 grid (representing 20 fake characters/images)
    z = [[random.random() * noise_level for _ in range(20)] for _ in range(20)]
    
    data = [{
        "z": z,
        "type": "heatmap",
        "colorscale": "Greys",
        "showscale": False
    }]
    
    layout = {
        "title": title,
        "xaxis": {"visible": False},
        "yaxis": {"visible": False},
        "margin": {"t": 30, "b": 10, "l": 10, "r": 10}
    }
    
    return {"data": data, "layout": layout}

# 1. Font Data Vis (Random Noise)
print("___DATA_06___")
print(json.dumps(generate_heatmap("Random Font Data Sample")))

# 2. Simple GAN (Blurry)
print("___DATA_07___")
print(json.dumps(generate_heatmap("Generated Images (Epoch 20000 - Dense GAN)")))

# 3. DCGAN (Sharper)
print("___DATA_08___")
print(json.dumps(generate_heatmap("Generated Images (Epoch 3000 - DCGAN)", noise_level=0.9)))
