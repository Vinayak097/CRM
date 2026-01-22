import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { DeveloperModel } from './src/models/developer.model.js';
dotenv.config();
const developers = [
    {
        "_id": "7c4b8c50-b7e1-4af1-8f66-95bd0074de91",
        "id": "7c4b8c50-b7e1-4af1-8f66-95bd0074de91",
        "developer_name": "Vianaar Homes",
        "developer_logo_url": null,
        "developer_rating": 8.7,
        "developer_previous_projects": [],
        "developer_contact": {
            "email": null,
            "phone": null
        },
        "reputation": "Vianaar Homes is a leading Goa-based developer known for luxury villas and apartments, blending sustainable design with Indo-Portuguese architectural elements.",
        "esgComplianceScore": 7,
        "projects": [
            "4279852b-b5c8-4d25-a814-a71190a8d40e",
            "8b69ce55-bcd9-4562-9bef-d8468a689a15",
            "6f6cc066-6378-42a8-95fe-7ac7b09ca4f0",
            "c51aa4e7-c9c0-48f7-9ad0-7a505dbea7bb",
            "e44ada2d-6912-4ea8-b5ec-dd58d92b190c",
            "7311b197-9803-4d5d-a164-875e52e56b04",
            "5843bee2-3201-4f53-bb1d-b207180a0cbc",
            "559ebc6e-aa3a-44ec-9553-7f6abe8ff9fc",
            "05662756-53f8-49a2-85e4-e8e7fc79024c",
            "cee35fc7-d9ca-418d-8d3f-526c91d60bec",
            "850dc9b5-ca87-4e0d-a275-684c37267201",
            "8aa31b3b-0751-42e8-8a2c-caaa3975f960",
            "0a5e1eb9-45fc-43d3-b2b0-758128306f59",
            "b382b26d-e5bd-44f0-99db-5aa520eeb3aa",
            "94be424e-a7a1-41f0-bede-a3e3ffb960ea",
            "c058be7f-d720-4ab4-a541-88d248e07b0e",
            "84b6db53-4276-42b4-bb24-70cb181c97e8",
            "610a7e8d-aa56-449d-bff3-712cd8aaea9b",
            "97226b74-7cfe-4488-8f37-db285a72740e",
            "26f7530d-2d74-4a84-93b4-efcdd44a5854",
            "3985f447-3800-4306-8e05-3ebc69fc5abf",
            "016a87d9-fb77-40e9-8035-5f40c1336d9a",
            "770b8bc0-cd2f-43a8-97df-bb1d86ddce5c",
            "279d3a5b-6f1a-47ba-9966-5e5f9e5b622d",
            "952c0d1a-61d4-48b4-9dc6-9b3e3d474059",
            "dc1d5a83-2f76-48c9-97bd-f69a933db0a4",
            "456a9d99-9649-4c0f-87fa-613530943e18",
            "a5e251f2-b1ad-4783-aedd-f08dd6b200a5",
            "fa35add2-1580-451f-ba86-ca7911abef0b",
            "cf3b5e1f-7225-44bd-92e0-97e61a2d2661",
            "f681c974-0b2b-4ee4-aa51-5f58c2dce202",
            "167f9713-1d00-4c3b-9787-7bf41d433f82",
            "dda2c7c2-f62a-4e2d-acca-1e2031b31fd7",
            "ab4e68a2-194a-4930-9408-1fd5c80467ad",
            "26df4d8f-f9f4-46e3-b551-f9c5310055d0",
            "ac96ee00-8923-4cd7-aa8a-fd75a8801140",
            "ce83f765-e408-4741-8c0c-7185749edbbd",
            "250a0f85-32df-45c8-a0bc-3d1cea0698ea",
            "c477f765-5908-4693-93de-f8b14b361df9",
            "1d90fe4d-6d69-4c17-95e5-4fd5d7b9bd92",
            "bbbc2637-6b7e-4df9-a2a2-01d8c5194f51",
            "f2c6a8f4-6cf4-488f-b835-6315ad31c09a",
            "65f43081-7ff8-4dae-ab84-e018c93f8b94",
            "7da5ee4b-e746-402f-913f-1053aa74fec2",
            "8f39f1a3-4b6a-4d47-afcb-6f4efb6605eb",
            "9d4df369-1362-4194-aa45-aeeda4fa3462",
            "22892f5e-33a5-42c3-b212-2ab8563a84f4",
            "3e3ce891-cbc7-4c72-ab95-f351bd04d418",
            "03e5ab51-7cc8-41b8-bf78-4dc37b4b34c6",
            "2dde1cca-93b9-4142-b110-338da830c79d",
            "6363d3f3-e7b5-4118-a1c6-db7c85f7313c",
            "aee70dda-cc86-4d2e-8153-bc71e4df55d2",
            "082859c1-e4b5-4ccc-af8f-9c38f39a98b7",
            "9c4b406e-4e76-4914-9962-a44702f0a390",
            "9f362f60-5a6a-4c7a-b4a8-360391f56502",
            "27a1a18c-3ea6-40dd-85bf-d58f7e57678e",
            "f4512634-0340-4f02-9f72-8db91ed2fc72",
            "5e385f21-f1a0-42fb-b1d2-82014f91d7c6",
            "336da40b-3fcb-4ffd-a684-feb06dafa93b",
            "5a2ce6af-70e1-4437-a8ea-894b16844cf8",
            "5d09ae74-7b37-48f0-880c-b3389f7cd6e5"
        ],
        "properties": [
            "b55649c9-9d41-4842-9832-9578579518e6"
        ],
        "created_at": "2025-11-06T12:22:55.793324Z",
        "updated_at": "2025-11-06T12:22:55.793324Z",
        "active": true
    },
    {
        "_id": "4a4a09fb-0f62-4db6-8ee0-56e4c484e291",
        "id": "4a4a09fb-0f62-4db6-8ee0-56e4c484e291",
        "developer_name": "Renowned Bali-based Developer",
        "developer_logo_url": null,
        "developer_rating": 8.7,
        "developer_previous_projects": [],
        "developer_contact": {
            "email": null,
            "phone": null
        },
        "reputation": "A leading Bali-based developer renowned for luxury residential, resort, and commercial properties, delivering exceptional craftsmanship and high returns for investors",
        "esgComplianceScore": 6,
        "projects": [],
        "properties": [],
        "created_at": "2025-11-06T12:22:55.793324Z",
        "updated_at": "2025-11-06T12:22:55.793324Z",
        "active": true
    },
    {
        "_id": "c35cbf81-47cb-4574-b36f-6d4cee06d808",
        "id": "c35cbf81-47cb-4574-b36f-6d4cee06d808",
        "developer_name": "MBS Group",
        "developer_logo_url": null,
        "developer_rating": 8.7,
        "developer_previous_projects": [],
        "developer_contact": {
            "email": null,
            "phone": null
        },
        "reputation": "MBS Group, with 20+ years in real estate, excels in construction, broking, and hospitality, delivering quality projects like Country Homes",
        "esgComplianceScore": 7,
        "projects": [
            "8128ec20-7418-4766-9b49-1346d79835d2",
            "b0b47d24-13b6-431c-abb1-dcf2bd0ffaa0",
            "0116bc02-983b-41e3-9c2b-1eb193798cd3",
            "45371021-0f0c-42e2-9bc0-4686806a3e6b"
        ],
        "properties": [],
        "created_at": "2025-11-06T12:22:55.793324Z",
        "updated_at": "2025-11-06T12:22:55.793324Z",
        "active": true
    }
];
async function seed() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/crm';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');
        // Clean collection
        await DeveloperModel.deleteMany({});
        console.log('Cleaned developer collection');
        // Seed data
        await DeveloperModel.insertMany(developers);
        console.log('Successfully seeded developer data');
        process.exit(0);
    }
    catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
}
seed();
//# sourceMappingURL=seedDevelopers.js.map