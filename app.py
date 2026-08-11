from flask import Flask, render_template, request, redirect, url_for, flash, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from translations import t, bilingual

app = Flask(__name__)

# Configuration
app.secret_key = "budget_secret_key_2026"
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:hamal123@localhost/budget_tracking'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

app.jinja_env.globals['t'] = t
app.jinja_env.globals['bilingual'] = bilingual

UNIT_TO_CRORE = {"Crore": 1, "Arba": 100, "Kharba": 10000}

def to_crore(value, unit):
    if value is None:
        return 0
    return value * UNIT_TO_CRORE.get(unit, 1)
def previous_fiscal_year_str(fy):
    """Turn '2083/84' into '2082/83' automatically."""
    try:
        start = int(fy.split('/')[0])
        prev_start = start - 1
        prev_end = str(prev_start + 1)[-2:]
        return f"{prev_start}/{prev_end}"
    except Exception:
        return ""


def check_percentage_total(model, field, new_value, exclude_id=None):
    """Sum every existing row's percentage (minus the one being edited) + the new value."""
    q = model.query
    if exclude_id is not None:
        q = q.filter(model.id != exclude_id)
    existing = sum(getattr(row, field) or 0 for row in q.all())
    return existing + new_value


# Custom filter for Nepali number formatting
@app.template_filter('format_number')
def format_number(value, unit=True):
    if value is None:
        return "0"

    if isinstance(value, str):
        value = float(value)

    if value >= 10000000000:   # 100 Kharba
        return f"{value/10000000000:.2f} Kharba"
    elif value >= 100000000:   # 1 Arba
        return f"{value/100000000:.2f} Arba"
    elif value >= 10000000:    # 1 Crore
        return f"{value/10000000:.2f} Cr"
    elif value >= 100000:
        return f"Rs {value:,.0f}"
    else:
        return f"Rs {value:,.0f}" if unit else f"{value:,.0f}"


# ====================== MODELS ======================
class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default="user")




class Ministry(db.Model):
    __tablename__ = "ministries"

    id = db.Column(db.Integer, primary_key=True)

    ministry_name = db.Column(
        db.String(200),
        nullable=False
    )

    nepali_name = db.Column(
        db.String(200)
    )

    budget_current = db.Column(
        db.Float,
        default=0
    )

    budget_previous = db.Column(
        db.Float,
        default=0
    )

    budget_share = db.Column(
        db.Float,
        default=0
    )

class District(db.Model):
    __tablename__ = "districts"
    id = db.Column(db.Integer, primary_key=True)
    district_name = db.Column(db.String(100), nullable=False)
    population = db.Column(db.Integer)
    allocation = db.Column(db.Float)
    percentage = db.Column(db.Float, default=0)
    per_citizen = db.Column(db.Float)
    hdi = db.Column(db.Float)
    status = db.Column(db.String(50))

class BudgetSummary(db.Model):
    __tablename__ = "budget_summary"
    id = db.Column(db.Integer, primary_key=True)
    fiscal_year = db.Column(db.String(20))
    total_budget = db.Column(db.Float)
    total_budget_unit = db.Column(db.String(20), default="Crore")
    previous_total_budget = db.Column(db.Float, default=0)   # NEW
    total_growth = db.Column(db.Float)
    capital_budget = db.Column(db.Float)
    capital_percentage = db.Column(db.Float)
    own_revenue = db.Column(db.Float)
    own_revenue_percentage = db.Column(db.Float)
    federal_dependency = db.Column(db.Float)
    education = db.Column(db.Float)
    health = db.Column(db.Float)
    infrastructure = db.Column(db.Float)
    agriculture = db.Column(db.Float)
class Revenue(db.Model):
    __tablename__ = "revenue"
    id = db.Column(db.Integer, primary_key=True)
    source = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float)
    percentage = db.Column(db.Float)


class Project(db.Model):
    __tablename__ = "projects"
    id = db.Column(db.Integer, primary_key=True)
    project_name = db.Column(db.String(200), nullable=False)
    district = db.Column(db.String(100))
    budget = db.Column(db.Float)
    percentage = db.Column(db.Float, default=0)
    spent = db.Column(db.Float)
    progress = db.Column(db.Integer)
    status = db.Column(db.String(50))


class Outcome(db.Model):
    __tablename__ = "outcomes"

    id = db.Column(db.Integer, primary_key=True)
    indicator = db.Column(db.String(100), nullable=False)
    province_value = db.Column(db.Float, nullable=False)
    national_value = db.Column(db.Float, nullable=False)
    target_value = db.Column(db.Float, nullable=False)

class Sdg(db.Model):
    __tablename__ = "sdgs"

    id = db.Column(db.Integer, primary_key=True)
    goal_number = db.Column(db.Integer, nullable=False)
    goal_name = db.Column(db.String(200), nullable=False)
    budget = db.Column(db.Float, nullable=False)
    percentage = db.Column(db.Float, default=0)
    nepali_name = db.Column(db.String(150))
# ====================== ADMIN DECORATOR ======================
def admin_required(f):
    def decorator(*args, **kwargs):
        if "user" not in session or session.get("role") != "admin":
            flash("Access Denied. Admin only.", "danger")
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    decorator.__name__ = f.__name__
    return decorator


# ====================== PUBLIC PAGES ======================
@app.route("/")
def home():
    summary = BudgetSummary.query.first()
    fiscal_year = summary.fiscal_year if summary else "2081/82"
    ministries = Ministry.query.all()
    revenues = Revenue.query.all()
    districts_all = District.query.all()

    total_population = sum(d.population or 0 for d in districts_all)  # in thousands, matching your existing district data convention

    total_budget_val = summary.total_budget if summary else 18.42
    
    prev_budget_val = summary.previous_total_budget if summary else 0
    computed_growth = round((total_budget_val - prev_budget_val) / prev_budget_val * 100, 1) if prev_budget_val else (summary.total_growth if summary else 9.6)

    def per_citizen(sector_crore):
        if not total_population:
            return 0
        return round((sector_crore * 10000000) / (total_population * 1000), 0)

    education_val = summary.education if summary else 12.34
    health_val = summary.health if summary else 9.47
    infrastructure_val = summary.infrastructure if summary else 15.98
    agriculture_val = summary.agriculture if summary else 7.21

    ministry_chart_data = [
    {
        "name": m.ministry_name,
        "budget": round(
            total_budget_val* (m.budget_share or 0) / 100,
            2
        )
    }
    for m in ministries
]
    revenue_chart_data = [{"name": r.source, "amount": r.amount or 0} for r in revenues]

    return render_template("index.html",
        fiscal_year=fiscal_year,
        total_budget=total_budget_val,
        total_budget_unit=summary.total_budget_unit if summary else "Crore",
        total_growth=computed_growth,
        total_growth_unit="%",
        capital_budget=summary.capital_budget if summary else 8.62,
        capital_budget_unit=summary.total_budget_unit if summary else "Crore",
        capital_percentage=summary.capital_percentage if summary else 47,
        capital_percentage_unit="%",
        own_revenue=summary.own_revenue if summary else 3.10,
        own_revenue_unit=summary.total_budget_unit if summary else "Crore",
        own_revenue_percentage=summary.own_revenue_percentage if summary else 17,
        own_revenue_percentage_unit="%",
        federal_dependency=summary.federal_dependency if summary else 76,
        population_thousands=total_population,
        per_citizen_spending=per_citizen(total_budget_val if summary and summary.total_budget_unit == "Crore" else to_crore(total_budget_val, summary.total_budget_unit if summary else "Crore")),
        education_per_person=per_citizen(education_val),
        health_per_person=per_citizen(health_val),
        roads_per_person=per_citizen(infrastructure_val),
        agriculture_per_person=per_citizen(agriculture_val),
        ministries=ministries,
        revenue_sources=revenues,
        ministry_chart_data=ministry_chart_data,
        revenue_chart_data=revenue_chart_data,
        last_updated="Baisakh 2082"
    )

@app.route("/ministries")
def ministries():
    summary = BudgetSummary.query.first()

    fiscal_year = summary.fiscal_year if summary else "2083/84"
    previous_fiscal_year = previous_fiscal_year_str(fiscal_year)

    total_crore = to_crore(
        summary.total_budget if summary else 0,
        summary.total_budget_unit if summary else "Crore"
    )

    ministry_list = Ministry.query.all()

    for m in ministry_list:
        m.computed_budget_current = round(
            total_crore * (m.budget_share or 0) / 100,
            2
        )

    percentage_sum = sum(
        m.budget_share or 0
        for m in ministry_list
    )

    ministry_page_chart = [
        {
            "name": m.ministry_name,
            "this_year": m.computed_budget_current,
            "last_year": m.budget_previous or 0
        }
        for m in ministry_list
    ]

    return render_template(
        "ministries.html",
        ministries=ministry_list,
        percentage_sum=percentage_sum,
        fiscal_year=fiscal_year,
        previous_fiscal_year=previous_fiscal_year,
        current_fiscal_year=fiscal_year,
        ministry_page_chart=ministry_page_chart
    )
@app.context_processor
def inject_fiscal_year():
    summary = BudgetSummary.query.first()

    return {
        "current_fiscal_year": summary.fiscal_year if summary else "2081/82"
    }

@app.route("/districts")
def districts():
    summary = BudgetSummary.query.first()
    fiscal_year = summary.fiscal_year if summary else "2083/84"
    previous_fiscal_year = previous_fiscal_year_str(fiscal_year)
    total_crore = to_crore(summary.total_budget if summary else 0, summary.total_budget_unit if summary else "Crore")

    district_list = District.query.all()
    for d in district_list:
        d.computed_allocation = round(total_crore * (d.percentage or 0) / 100, 2)
        d.computed_per_citizen = round((d.computed_allocation * 10000000) / d.population, 0) if d.population else 0

    percentage_sum = sum(d.percentage or 0 for d in district_list)

    return render_template("districts.html", districts=district_list, percentage_sum=percentage_sum,
                            fiscal_year=fiscal_year, previous_fiscal_year=previous_fiscal_year)


@app.route("/revenue")
def revenue():
    summary = BudgetSummary.query.first()
    fiscal_year = summary.fiscal_year if summary else "2083/84"
    return render_template("revenue.html", revenue=Revenue.query.all(), fiscal_year=fiscal_year)


@app.route("/projects")
def projects():
    summary = BudgetSummary.query.first()
    fiscal_year = summary.fiscal_year if summary else "2083/84"
    previous_fiscal_year = previous_fiscal_year_str(fiscal_year)
    total_crore = to_crore(summary.total_budget if summary else 0, summary.total_budget_unit if summary else "Crore")

    project_list = Project.query.all()
    for p in project_list:
        p.computed_budget = round(total_crore * (p.percentage or 0) / 100, 2)

    return render_template("projects.html", projects=project_list,
                            fiscal_year=fiscal_year, previous_fiscal_year=previous_fiscal_year)

@app.route("/outcomes")
def outcomes():

    summary = BudgetSummary.query.first()

    fiscal_year = summary.fiscal_year if summary else "2083/84"

    total_crore = to_crore(
        summary.total_budget if summary else 0,
        summary.total_budget_unit if summary else "Crore"
    )

    # ================= OUTCOMES =================

    outcome_list = Outcome.query.all()

    for o in outcome_list:

        gap = (
            (o.province_value or 0)
            - (o.national_value or 0)
        )

        o.gap = round(abs(gap), 1)

        o.behind = gap < 0

        o.target_gap = round(
            (o.target_value or 0)
            - (o.province_value or 0),
            1
        )

    behind_list = sorted(
        [o for o in outcome_list if o.behind],
        key=lambda o: o.gap,
        reverse=True
    )[:4]

    # ================= SDG =================

    sdg_list = Sdg.query.all()

    for s in sdg_list:

        s.computed_amount = round(
            total_crore * (s.percentage or 0) / 100,
            2
        )

    return render_template(
        "outcomes.html",
        outcomes=outcome_list,
        behind_list=behind_list,
        sdgs=sdg_list,
        fiscal_year=fiscal_year
    )
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        user = User.query.filter_by(username=request.form["username"]).first()
        if user and check_password_hash(user.password, request.form["password"]):
            session["user"] = user.username
            session["role"] = user.role
            flash("Login successful!", "success")
            return redirect(url_for("dashboard"))
        flash("Invalid username or password", "danger")
    return render_template("login.html")


@app.route("/logout")
def logout():
    session.clear()
    flash("You have been logged out.", "info")
    return redirect(url_for("login"))


@app.route("/dashboard")
@admin_required
def dashboard():
    summary = BudgetSummary.query.first()
    fiscal_year = summary.fiscal_year if summary else "2083/84"
    previous_fiscal_year = previous_fiscal_year_str(fiscal_year)
    return render_template("dashboard.html", summary=summary, fiscal_year=fiscal_year, previous_fiscal_year=previous_fiscal_year)


# ====================== CRUD OPERATIONS ======================

# === Revenue ===
@app.route("/add-revenue", methods=["GET", "POST"])
@admin_required
def add_revenue():
    if request.method == "POST":
        item = Revenue(
            source=request.form["source"],
            amount=float(request.form["amount"]),
            percentage=float(request.form["percentage"])
        )
        db.session.add(item)
        db.session.commit()
        flash("Revenue added successfully!", "success")
        return redirect(url_for("revenue"))
    return render_template("add_revenue.html")


@app.route("/edit-revenue/<int:id>", methods=["GET", "POST"])
@admin_required
def edit_revenue(id):
    item = Revenue.query.get_or_404(id)
    if request.method == "POST":
        item.source = request.form["source"]
        item.amount = float(request.form["amount"])
        item.percentage = float(request.form["percentage"])
        db.session.commit()
        flash("Revenue updated!", "success")
        return redirect(url_for("revenue"))
    return render_template("edit_revenue.html", revenue=item)
@app.route("/add-sdg", methods=["GET", "POST"])
@admin_required
def add_sdg():

    if request.method == "POST":

        goal_number = int(request.form["goal_number"])
        goal_name = request.form["goal_name"]
        nepali_name = request.form.get("nepali_name")

        new_pct = float(request.form["percentage"])

        total_after = check_percentage_total(
            Sdg,
            "percentage",
            new_pct
        )

        if total_after > 100.01:
            flash(
                f"Cannot save — SDGs would total {total_after:.1f}% of the budget.",
                "danger"
            )
            return redirect(url_for("add_sdg"))

        summary = BudgetSummary.query.first()

        if summary:
            total_crore = to_crore(
                summary.total_budget,
                summary.total_budget_unit
            )

            budget = round(
                total_crore * new_pct / 100,
                2
            )
        else:
            budget = 0

        item = Sdg(
            goal_number=goal_number,
            goal_name=goal_name,
            nepali_name=nepali_name,
            percentage=new_pct,
            budget=budget
        )

        db.session.add(item)
        db.session.commit()

        flash("SDG goal added successfully!", "success")

        return redirect(url_for("outcomes"))

    return render_template("add_sdg.html")

@app.route("/edit-sdg/<int:id>", methods=["GET", "POST"])
@admin_required
def edit_sdg(id):
    item = Sdg.query.get_or_404(id)
    if request.method == "POST":
        new_pct = float(request.form["percentage"])
        total_after = check_percentage_total(Sdg, "percentage", new_pct, exclude_id=id)
        if total_after > 100.01:
            flash(f"Cannot save — SDGs would total {total_after:.1f}% of the budget. Reduce this or another goal's percentage first.", "danger")
            return redirect(url_for("edit_sdg", id=id))
        item.goal_name = request.form["goal_name"]
        item.nepali_name = request.form.get("nepali_name")
        item.percentage = new_pct
        db.session.commit()
        flash("SDG goal updated!", "success")
        return redirect(url_for("outcomes"))
    return render_template("edit_sdg.html", sdg=item)


@app.route("/delete-sdg/<int:id>", methods=["GET", "POST"])
@admin_required
def delete_sdg(id):
    item = Sdg.query.get_or_404(id)
    if request.method == "POST":
        db.session.delete(item)
        db.session.commit()
        flash("SDG goal deleted successfully")
        return redirect(url_for("outcomes"))
    return render_template("delete_sdg.html", sdg=item)


# === Ministry ===
@app.route("/add-ministry", methods=["GET", "POST"])
@admin_required
def add_ministry():
    if request.method == "POST":
        new_share = float(request.form["budget_share"])
        total_after = check_percentage_total(Ministry, "budget_share", new_share)
        if total_after > 100.01:
            flash(f"Cannot save — ministries would total {total_after:.1f}% of the budget. Reduce this or another ministry's percentage first.", "danger")
            return redirect(url_for("add_ministry"))
        item = Ministry(
    ministry_name=request.form["ministry_name"],
    nepali_name=request.form.get("nepali_name"),
    budget_current=0,
    budget_previous=float(request.form["budget_previous"]),
    budget_share=new_share
)
        db.session.add(item)
        db.session.commit()
        flash("Ministry added successfully!", "success")
        return redirect(url_for("ministries"))
    return render_template("add_ministry.html")


@app.route("/edit-ministry/<int:id>", methods=["GET", "POST"])
@admin_required
def edit_ministry(id):
    item = Ministry.query.get_or_404(id)
    if request.method == "POST":
        new_share = float(request.form["budget_share"])
        total_after = check_percentage_total(Ministry, "budget_share", new_share, exclude_id=id)
        if total_after > 100.01:
            flash(f"Cannot save — ministries would total {total_after:.1f}% of the budget. Reduce this or another ministry's percentage first.", "danger")
            return redirect(url_for("edit_ministry", id=id))
        item.ministry_name = request.form["ministry_name"]
        item.nepali_name = request.form.get("nepali_name")
        item.budget_previous = float(
    request.form["budget_previous"]
)
        item.budget_share = new_share
        db.session.commit()
        flash("Ministry updated!", "success")
        return redirect(url_for("ministries"))
    return render_template("edit_ministry.html", ministry=item)

# === District ===
@app.route("/add-district", methods=["GET", "POST"])
@admin_required
def add_district():
    if request.method == "POST":
        item = District(
            district_name=request.form["district_name"],
            population=int(request.form["population"]),
            percentage=float(request.form["percentage"]),
            hdi=float(request.form["hdi"]) if request.form.get("hdi") else None,
            status=request.form.get("status", "")
        )
        db.session.add(item)
        db.session.commit()
        flash("District added successfully!", "success")
        return redirect(url_for("districts"))
    return render_template("add_district.html")


@app.route("/edit-district/<int:id>", methods=["GET", "POST"])
@admin_required
def edit_district(id):
    item = District.query.get_or_404(id)
    if request.method == "POST":
        item.district_name = request.form["district_name"]
        item.population = int(request.form["population"])
        item.percentage = float(request.form["percentage"])
        item.hdi = float(request.form["hdi"]) if request.form.get("hdi") else None
        item.status = request.form.get("status", "")
        db.session.commit()
        flash("District updated!", "success")
        return redirect(url_for("districts"))
    return render_template("edit_district.html", district=item)


# === Project ===
@app.route("/add-project", methods=["GET", "POST"])
@admin_required
def add_project():
    if request.method == "POST":
        item = Project(
            project_name=request.form["project_name"],
            district=request.form["district"],
            percentage=float(request.form["percentage"]),
            spent=float(request.form["spent"]),
            progress=int(request.form["progress"]),
            status=request.form["status"]
        )
        db.session.add(item)
        db.session.commit()
        flash("Project added successfully!", "success")
        return redirect(url_for("projects"))
    return render_template("add_project.html")


@app.route("/edit-project/<int:id>", methods=["GET", "POST"])
@admin_required
def edit_project(id):
    item = Project.query.get_or_404(id)
    if request.method == "POST":
        item.project_name = request.form["project_name"]
        item.district = request.form["district"]
        item.percentage = float(request.form["percentage"])
        item.spent = float(request.form["spent"])
        item.progress = int(request.form["progress"])
        item.status = request.form["status"]
        db.session.commit()
        flash("Project updated!", "success")
        return redirect(url_for("projects"))
    return render_template("edit_project.html", project=item)


# === Outcome ===
@app.route("/add-outcome", methods=["GET", "POST"])
@admin_required
def add_outcome():
    if request.method == "POST":
        item = Outcome(
            indicator=request.form["indicator"],
            province_value=float(request.form["province_value"]),
            national_value=float(request.form["national_value"]),
            target_value=float(request.form["target_value"])
        )
        db.session.add(item)
        db.session.commit()
        flash("Outcome added successfully!", "success")
        return redirect(url_for("outcomes"))
    return render_template("add_outcome.html")


@app.route("/edit-outcome/<int:id>", methods=["GET", "POST"])
@admin_required
def edit_outcome(id):
    item = Outcome.query.get_or_404(id)
    if request.method == "POST":
        item.indicator = request.form["indicator"]
        item.province_value = float(request.form["province_value"])
        item.national_value = float(request.form["national_value"])
        item.target_value = float(request.form["target_value"])
        db.session.commit()
        flash("Outcome updated!", "success")
        return redirect(url_for("outcomes"))
    return render_template("edit_outcome.html", outcome=item)


@app.route("/delete-ministry/<int:id>", methods=["GET", "POST"])
def delete_ministry(id):
    if "user" not in session:
        return redirect(url_for("login"))
    if session.get("role") != "admin":
        flash("Access Denied")
        return redirect(url_for("home"))

    ministry = Ministry.query.get_or_404(id)

    if request.method == "POST":
        db.session.delete(ministry)
        db.session.commit()
        flash("Ministry deleted successfully")
        return redirect(url_for("ministries"))

    return render_template("delete_ministry.html", ministry=ministry)


@app.route("/delete-district/<int:id>", methods=["GET", "POST"])
def delete_district(id):
    if "user" not in session:
        return redirect(url_for("login"))
    if session.get("role") != "admin":
        flash("Access Denied")
        return redirect(url_for("home"))

    district = District.query.get_or_404(id)

    if request.method == "POST":
        db.session.delete(district)
        db.session.commit()
        flash("District deleted successfully")
        return redirect(url_for("districts"))

    return render_template("delete_district.html", district=district)


@app.route("/delete-revenue/<int:id>", methods=["GET", "POST"])
def delete_revenue(id):
    if "user" not in session:
        return redirect(url_for("login"))
    if session.get("role") != "admin":
        flash("Access Denied")
        return redirect(url_for("home"))

    revenue_item = Revenue.query.get_or_404(id)

    if request.method == "POST":
        db.session.delete(revenue_item)
        db.session.commit()
        flash("Revenue source deleted successfully")
        return redirect(url_for("revenue"))

    return render_template("delete_revenue.html", revenue_item=revenue_item)


@app.route("/delete-project/<int:id>", methods=["GET", "POST"])
def delete_project(id):
    if "user" not in session:
        return redirect(url_for("login"))
    if session.get("role") != "admin":
        flash("Access Denied")
        return redirect(url_for("home"))

    project = Project.query.get_or_404(id)

    if request.method == "POST":
        db.session.delete(project)
        db.session.commit()
        flash("Project deleted successfully")
        return redirect(url_for("projects"))

    return render_template("delete_project.html", project=project)


@app.route("/delete-outcome/<int:id>", methods=["GET", "POST"])
def delete_outcome(id):
    if "user" not in session:
        return redirect(url_for("login"))
    if session.get("role") != "admin":
        flash("Access Denied")
        return redirect(url_for("home"))

    outcome = Outcome.query.get_or_404(id)

    if request.method == "POST":
        db.session.delete(outcome)
        db.session.commit()
        flash("Outcome deleted successfully")
        return redirect(url_for("outcomes"))

    return render_template("delete_outcome.html", outcome=outcome)
@app.route("/rollover-fiscal-year", methods=["POST"])
@admin_required
def rollover_fiscal_year():

    summary = BudgetSummary.query.first()

    if not summary:
        flash(
            "No budget summary found yet.",
            "danger"
        )
        return redirect(url_for("dashboard"))

    # Convert current total budget to crore
    total_crore = to_crore(
        summary.total_budget,
        summary.total_budget_unit
    )

    # Move current ministry budgets into previous-year history
    for m in Ministry.query.all():

        m.budget_previous = round(
            total_crore * (m.budget_share or 0) / 100,
            2
        )

    # Save current total budget as previous total
    summary.previous_total_budget = total_crore

    db.session.commit()

    flash(
        "This year's figures are now saved as previous-year history.",
        "success"
    )

    return redirect(url_for("edit_summary"))

# === Budget Summary ===
@app.route("/edit-summary", methods=["GET", "POST"])
@admin_required
def edit_summary():

    summary = BudgetSummary.query.first()

    if not summary:
        summary = BudgetSummary()
        db.session.add(summary)

    if request.method == "POST":

        # =========================
        # BASIC BUDGET INFORMATION
        # =========================

        summary.fiscal_year = request.form["fiscal_year"]

        summary.total_budget = float(
            request.form["total_budget"]
        )

        summary.total_budget_unit = request.form[
            "total_budget_unit"
        ]

        # =========================
        # CAPITAL BUDGET
        # =========================

        summary.capital_budget = float(
            request.form["capital_budget"]
        )

        # =========================
        # OWN SOURCE REVENUE
        # =========================

        summary.own_revenue = float(
            request.form["own_revenue"]
        )

        # =========================
        # AUTOMATIC PERCENTAGES
        # =========================

        if summary.total_budget and summary.total_budget != 0:

            summary.capital_percentage = round(
                (
                    summary.capital_budget
                    / summary.total_budget
                ) * 100,
                1
            )

            summary.own_revenue_percentage = round(
                (
                    summary.own_revenue
                    / summary.total_budget
                ) * 100,
                1
            )

        else:

            summary.capital_percentage = 0
            summary.own_revenue_percentage = 0

        # =========================
        # FEDERAL DEPENDENCY
        # =========================

        federal_grant = Revenue.query.filter(
            Revenue.source.ilike("%Federal Grants%")
        ).first()

        if federal_grant and summary.total_budget:

            summary.federal_dependency = round(
                (
                    federal_grant.amount
                    / summary.total_budget
                ) * 100,
                1
            )

        else:

            summary.federal_dependency = 0

        # =========================
        # OTHER SECTOR VALUES
        # =========================

        summary.education = float(
            request.form["education"]
        )

        summary.health = float(
            request.form["health"]
        )

        summary.infrastructure = float(
            request.form["infrastructure"]
        )

        summary.agriculture = float(
            request.form["agriculture"]
        )

        # =========================
        # PREVIOUS YEAR GROWTH
        # =========================

        if summary.previous_total_budget:
            summary.total_growth = round(
                (
                    (
                        summary.total_budget
                        - summary.previous_total_budget
                    )
                    / summary.previous_total_budget
                ) * 100,
                1
            )
        else:
            summary.total_growth = 0

        db.session.commit()

        flash(
            "Budget Summary updated successfully!",
            "success"
        )

        return redirect(
            url_for("dashboard")
        )

    return render_template(
        "edit_summary.html",
        summary=summary
    )
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)