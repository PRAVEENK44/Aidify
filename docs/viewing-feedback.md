# Viewing Customer Feedback

There are two ways to view the customer feedback data that's collected from the Contact page:

## 1. Through the Admin Dashboard

The easiest way to view customer feedback is through the Admin Dashboard in the application.

1. Log in to the application with an admin account
2. Navigate to the **Admin Dashboard** page
3. Click on the **Feedback** tab
4. Here you can see all feedback submissions with:
   - Date submitted
   - Feedback type (general, app experience, support)
   - Star rating (1-5 stars)
   - User information (name and email)
   - Feedback details

The feedback data is automatically refreshed when you open the page, or you can click the "Refresh" button to load the latest data.

## 2. Through the Supabase Dashboard

For direct database access or advanced querying, you can view the feedback data in Supabase:

1. Go to the [Supabase Project Dashboard](https://xqinwmecsxjzlybxlkoh.supabase.co)
2. Log in with your Supabase admin credentials
3. In the left sidebar, click on **Table Editor**
4. Select the `customer_feedback` table
5. You'll see all feedback entries in the table view

### SQL Queries for Advanced Analysis

You can also run SQL queries in the Supabase SQL Editor for more advanced analysis:

```sql
-- Get all feedback submissions ordered by date (newest first)
SELECT * FROM customer_feedback ORDER BY timestamp DESC;

-- Get average rating by feedback type
SELECT 
  feedback_type, 
  AVG(rating) as average_rating,
  COUNT(*) as submission_count
FROM customer_feedback
GROUP BY feedback_type
ORDER BY average_rating DESC;

-- Get feedback from a specific time period
SELECT * FROM customer_feedback
WHERE timestamp > '2024-07-01' AND timestamp < '2024-07-31'
ORDER BY timestamp DESC;

-- Get feedback with low ratings (1-2 stars)
SELECT * FROM customer_feedback
WHERE rating <= 2
ORDER BY timestamp DESC;
```

## Setting Up Email Notifications for New Feedback

To receive email notifications when customers submit feedback:

1. In the Supabase dashboard, go to **Database** → **Functions**
2. Create a new database function:

```sql
CREATE OR REPLACE FUNCTION notify_on_feedback_insert()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'new_feedback',
    json_build_object(
      'id', NEW.id,
      'feedback_type', NEW.feedback_type,
      'rating', NEW.rating,
      'name', COALESCE(NEW.name, 'Anonymous'),
      'email', NEW.email,
      'details', NEW.details,
      'timestamp', NEW.timestamp
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER feedback_insert_trigger
AFTER INSERT ON customer_feedback
FOR EACH ROW
EXECUTE FUNCTION notify_on_feedback_insert();
```

3. Set up an Edge Function in Supabase to handle the notification and send an email

## Exporting Feedback Data

To export feedback data for reporting or analysis:

1. In the Supabase Table Editor, select the `customer_feedback` table
2. Click the "Export" button in the top right corner
3. Choose CSV or JSON format
4. Your feedback data will be downloaded for offline analysis

You can also use the Supabase API to programmatically export data for integration with other systems. 