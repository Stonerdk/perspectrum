from typing import List
from models import Persona, ChatRoom, AvatarType, ChatMessage

# CONST
personas: List[Persona] = [
    Persona(
        id="1",
        name="Sophia",
        role="law",
        color="blue",
        avatar=AvatarType(
            accessoriesType="Sunglasses",           # "Glasses" → "Sunglasses"
            backgroundColor="PastelBlue",
            clotheColor="Blue01",                    # "Blue" → "Blue01"
            clotheType="Hoodie",
            eyeType="Default",
            eyebrowType="UpDown",
            hairColor="Black",
            mouthType="Smile",
            skinColor="Light",
            topType="LongHairStraight",
        )
    ),
    Persona(
        id="2",
        name="Liam",
        role="environment",
        color="green",
        avatar=AvatarType(
            accessoriesType="Blank",                # "None" → "Blank"
            backgroundColor="PastelGreen",
            clotheColor="PastelGreen",               # "ForestGreen" → "PastelGreen"
            clotheType="Overall",
            eyeType="Default",
            eyebrowType="Default",
            hairColor="Brown",
            mouthType="Twinkle",
            skinColor="Brown",                        # "Medium" → "Brown"
            topType="ShortHairShortCurly",
        )
    ),
    Persona(
        id="3",
        name="Ava",
        role="education",
        color="yellow",
        avatar=AvatarType(
            accessoriesType="Blank",                # "Headphones" → "Blank" (대체 불가)
            backgroundColor="PastelYellow",
            clotheColor="PastelRed",                  # "Purple" → "PastelRed"
            clotheType="BlazerShirt",
            eyeType="Happy",
            eyebrowType="DefaultNatural",
            hairColor="Blonde",
            mouthType="Smile",
            skinColor="Light",
            topType="LongHairDreads",
        )
    ),
    Persona(
        id="4",
        name="Noah",
        role="culture",
        color="purple",
        avatar=AvatarType(
            accessoriesType="Hat",                   # "Beanie" → "Hat"
            backgroundColor="PastelPurple",
            clotheColor="PastelRed",                  # "Maroon" → "PastelRed"
            clotheType="ShirtVNeck",
            eyeType="Default",
            eyebrowType="Default",
            hairColor="Auburn",
            mouthType="Twinkle",
            skinColor="Pale",
            topType="ShortHairShortCurly",            # "ShortHairShortRound" → "ShortHairShortCurly"
        )
    ),
    Persona(
        id="5",
        name="Emma",
        role="economics",
        color="green",
        avatar=AvatarType(
            accessoriesType="Blank",                # "Scarf" → "Blank"
            backgroundColor="PastelGreen",
            clotheColor="Black",
            clotheType="Overall",
            eyeType="Default",
            eyebrowType="UpDown",
            hairColor="Black",
            mouthType="Twinkle",
            skinColor="Pale",
            topType="LongHairMiaWallace",
        )
    ),
    Persona(
        id="6",
        name="Lucas",
        role="science",
        color="orange",
        avatar=AvatarType(
            accessoriesType="Blank",                # "None" → "Blank"
            backgroundColor="PastelOrange",
            clotheColor="White",
            clotheType="ShirtScoopNeck",
            eyeType="Surprised",
            eyebrowType="DefaultNatural",
            hairColor="Brown",
            mouthType="Twinkle",
            skinColor="Light",
            topType="ShortHairShortFlat",
        )
    ),
    Persona(
        id="7",
        name="Mia",
        role="politics",
        color="blue",
        avatar=AvatarType(
            accessoriesType="Blank",                # "Earrings" → "Blank"
            backgroundColor="PastelBlue",
            clotheColor="Blue03",                     # "NavyBlue" → "Blue03"
            clotheType="Hoodie",
            eyeType="Default",
            eyebrowType="UpDown",
            hairColor="Black",
            mouthType="Twinkle",
            skinColor="Pale",
            topType="LongHairStraight",
        )
    ),
    Persona(
        id="8",
        name="Ethan",
        role="social",
        color="purple",
        avatar=AvatarType(
            accessoriesType="Blank",                # "None" → "Blank"
            backgroundColor="PastelPurple",
            clotheColor="Gray02",
            clotheType="ShirtCrewNeck",               # "CasualShirt" → "ShirtCrewNeck"
            eyeType="DefaultNatural",
            eyebrowType="Default",
            hairColor="Auburn",
            mouthType="Twinkle",
            skinColor="Pale",
            topType="ShortHairFrizzle",
        )
    )
]

chatrooms: List[ChatRoom] = [
    ChatRoom(
        id="0",
        participants=[],
        messages=[]
    ),
]