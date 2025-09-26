def main():
    import base64

    from openai import OpenAI
    from pydantic import BaseModel

    client = OpenAI()

    # Function to encode the image
    def encode_image(image_path):
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode("utf-8")

    # Path to your image
    image_path = "test.jpg"

    # Getting the Base64 string
    base64_image = encode_image(image_path)

    from enum import Enum

    class GiveBoxItem(str, Enum):
        BOOKS = "books"
        CLOTHES = "clothes"
        TOYS = "toys"
        ELECTRONICS = "electronics"
        KITCHEN_ITEMS = "kitchen_items"
        HOUSEHOLD_GOODS = "household_goods"
        SHOES = "shoes"
        BAGS = "bags"
        GAMES = "games"
        DECORATIONS = "decorations"
        TOOLS = "tools"
        OFFICE_SUPPLIES = "office_supplies"
        PLANTS = "plants"
        FOOD = "food"
        OTHER = "other"

    class Item(BaseModel):
        item: GiveBoxItem
        description: str

    class ItemList(BaseModel):
        items: list[Item]

    response = client.responses.parse(
        model="gpt-5-mini",
        input=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": "Create a list of items in the givebox.",
                    },
                    {
                        "type": "input_image",
                        "image_url": f"data:image/jpeg;base64,{base64_image}",
                    },
                ],
            }
        ],
        text_format=ItemList,
    )

    # Print the parsed response in a table format
    from tabulate import tabulate

    # Extract items from the parsed response
    items_data = []
    for item in response.output_parsed.items:
        items_data.append([item.item.value, item.description])

    # Create and print the table
    headers = ["Item Type", "Description"]
    table = tabulate(items_data, headers=headers, tablefmt="grid")
    print(table)


if __name__ == "__main__":
    main()
