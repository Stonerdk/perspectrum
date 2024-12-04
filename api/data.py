from typing import List
from models import Persona, ChatRoom, AvatarType, ChatMessage

# CONST
personas: List[Persona] = [
    Persona(
        id="1",
        name="HB",
        role="Project Owner",
        color="green",
        avatar=AvatarType(
            accessoriesType="Blank",
            backgroundColor="PastelGreen",
            clotheColor="White",
            clotheType="BlazerSweater",
            eyeType="Default",
            eyebrowType="UpDown",
            hairColor="Black",
            mouthType="Twinkle",
            skinColor="Pale",
            topType="LongHairBob",
        )
    ),
    Persona(
        id="2",
        name="SY",
        role="AI Expert",
        color="orange",
        avatar=AvatarType(
            accessoriesType="Blank",
            backgroundColor="PastelGreen",
            clotheColor="White",
            clotheType="Hoodie",
            eyeType="Default",
            eyebrowType="UpDown",
            hairColor="Black",
            mouthType="Twinkle",
            skinColor="Pale",
            topType="LongHairBigHair",
        )
    ),
    Persona(
        id="3",
        name="Green",
        role="Businessman",
        color="purple",
        avatar=AvatarType(
            accessoriesType="Blank",
            backgroundColor="PastelBlue",
            clotheColor="Gray02",
            clotheType="BlazerShirt",
            eyeType="Surprised",
            eyebrowType="DefaultNatural",
            hairColor="Auburn",
            mouthType="Twinkle",
            skinColor="Pale",
            topType="ShortHairFrizzle",
        )
    ),
    Persona(
        id="4",
        name="Dilan",
        role="Designer",
        color="blue",
        avatar=AvatarType(
            accessoriesType="Round",
            backgroundColor="PastelBlue",
            clotheColor="Black",
            clotheType="ShirtScoopNeck",
            eyeType="Surprised",
            eyebrowType="SadConcerned",
            hairColor="Auburn",
            mouthType="Serious",
            skinColor="Tanned",
            topType="ShortHairDreads01",
        )
    ),
    Persona(
        id="5",
        name="Jasmine",
        role="Athlete",
        color="red",
        avatar=AvatarType(
            accessoriesType="Wayfarers",
            backgroundColor="PastelBlue",
            clotheColor="White",
            clotheType="Hoodie",
            eyeType="Wink",
            eyebrowType="Default",
            hairColor="Black",
            mouthType="Serious",
            skinColor="DarkBrown",
            topType="LongHairCurly",
        )
    )
]

chatrooms: List[ChatRoom] = [
    ChatRoom(
        id="0",
        participants=["1", "2"],
        messages=[
            ChatMessage(id="00", sender="0", message="please explain entropy minimization in terms of test time adaptation", timestamp="2024-01-01T10:00:00Z"),
            ChatMessage(id="01", sender="1", message="Entropy minimization in terms of test-time adaptation is a method used to adapt a model to generalize to new and different data during testing. This approach is commonly known as tent or test entropy. The method optimizes the model for confidence as measured by the entropy of its predictions and allows the model to adapt to different target data without relying on other losses or data.\n\nIn this context, entropy is related to both error and shift. More confident predictions tend to be more accurate, thus entropy is associated with error. With respect to shift, as the level of corruption increases, the entropy also increases, which strongly correlates to the loss.\n\nThe process of entropy minimization involves normalizing and transforming inference on target data. This is done by estimating statistics and optimizing affine parameters on a batch-by-batch basis. This modulation is efficient for adapting during testing, even for online updates. It's important to note that tent doesn't restrict or alter model training, but uses the model parameters to adapt itself.\n\nEntropy minimization has proven to be effective in reducing not just entropy, but also error. It has shown to be efficient in reducing generalization errors for image classification on corrupted ImageNet and CIFAR-10/100 datasets. It has also been effective in handling source-free domain adaptation on digit recognition from SVHN to MNIST/MNIST-M/USPS, as well as on semantic segmentation from GTA to Cityscapes.", timestamp="2024-01-01T10:01:00Z"),
            ChatMessage(id="02", sender="0", message="Please explain in detail the knowledge distillation methodology used in CLIPSelf.", timestamp="2024-01-01T10:01:02Z"),
            ChatMessage(id="03", sender="2", message="CLIPSelf is an approach proposed to enhance the performance of Contrastive Language-Image Pre-training (CLIP) models, specifically those that use vision transformers (ViTs). It aims to improve the transfer of vision-language alignment from global image representation to local region representation. This is particularly beneficial for open-vocabulary dense prediction tasks like object detection and image segmentation.\n\nCLIPSelf is uniquely designed to remove the need for complex region-text matching processes or the acquisition of additional labeled region-text pairs. Instead, it fine-tunes CLIP ViTs by maximizing the cosine similarities between region representations and the image representations of corresponding image crops. In this method, regions can be obtained by dividing an image into a grid of m × n patches.\n\nThe introduction of CLIPSelf has led to a significant strengthening of the vision-language alignment of CLIP ViTs’ dense features, enhancing their applicability to downstream open-vocabulary dense prediction tasks. It has been tested and proven effective on open-vocabulary object detection and image segmentation benchmarks, where it has achieved state-of-the-art performance.", timestamp="2024-01-01T10:02:00Z")
        ]
    ),
    ChatRoom(
        id="1",
        participants=["2", "3", "4", "5"],
        messages=[
            ChatMessage(id="10", sender="0", message="프로젝트 진행 상황은 어때요?", timestamp="2024-01-02T11:00:00Z"),
            ChatMessage(id="11", sender="3", message="順調に進んでいます。", timestamp="2024-01-02T11:01:00Z")
        ]
    )
]