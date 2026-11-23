from django.db import migrations, models


def set_income_categories(apps, schema_editor):
    """Give existing income records a category based on their source text."""
    Income = apps.get_model("finance", "Income")
    keywords = [
        ("pocket", "Pocket Money"),
        ("allowance", "Pocket Money"),
        ("scholar", "Scholarship"),
        ("freelanc", "Freelance"),
        ("salary", "Salary"),
    ]
    for income in Income.objects.all():
        text = (income.source or "").lower()
        category = "Other"
        for keyword, name in keywords:
            if keyword in text:
                category = name
                break
        income.category = category
        income.save(update_fields=["category"])


class Migration(migrations.Migration):

    dependencies = [
        ("finance", "0003_profile_email_alerts"),
    ]

    operations = [
        migrations.AddField(
            model_name="income",
            name="category",
            field=models.CharField(default="Other", max_length=50),
        ),
        migrations.RunPython(set_income_categories, migrations.RunPython.noop),
    ]