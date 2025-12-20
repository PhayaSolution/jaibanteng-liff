# API Contracts: Separate Flows & Charts

## 1. Get Categories
Fetch categories, optionally filtered by type.

**Endpoint**: `GET /api/categories`

**Query Parameters**:
- `type` (optional): "INCOME" | "EXPENSE"

**Response**: `200 OK`
```json
[
  {
    "id": "c1",
    "name": "Food",
    "type": "EXPENSE"
  },
  {
    "id": "c2",
    "name": "Salary",
    "type": "INCOME"
  }
]
```

## 2. Get Transaction Statistics
Fetch aggregated statistics for charts.

**Endpoint**: `GET /api/stats`

**Query Parameters**:
- `month`: ISO Date String (e.g. "2025-12-01") or specific month index
- `year`: Number (e.g. 2025)
- `type`: "INCOME" | "EXPENSE"

**Response**: `200 OK`
```json
{
  "total": 5000,
  "byCategory": [
    {
      "categoryId": "c1",
      "categoryName": "Food",
      "amount": 2000,
      "percentage": 40.0,
      "color": "#FF5733"
    },
    {
      "categoryId": "c3",
      "categoryName": "Transport",
      "amount": 1000,
      "percentage": 20.0,
      "color": "#33FF57"
    }
  ]
}
```
