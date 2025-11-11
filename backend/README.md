# Spreadsheet Intake
`python -m app.database.intake_* <path_to_xlsx>`
- some intake scripts take different arguments so please check the args first

# example environment variables
- environment variables are loaded from `.env` file which should be placed in /backend/.env
```env
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///dev.db # note that this is only read when running prod config as specified below
FLASK_ENV=development
```

# routes
- only route route used right now is `/api/food_resources` which returns all of the data points