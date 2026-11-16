"""Runs a lesson's `python run` cells and records what each prints, the way a
notebook would. Usage: python3 run_cells.py request.json result.json figdir

request.json: {"notebook": bool, "cells": [{"code": str, "input": [str]}]}
In a notebook lesson every cell shares one namespace; otherwise each cell is
a fresh, standalone program. Charts drawn with matplotlib are saved as SVG.
"""
import builtins
import contextlib
import io
import json
import linecache
import os
import sys
import traceback
import warnings

os.environ.setdefault("MPLBACKEND", "Agg")
warnings.filterwarnings("ignore")
request_path, result_path, figure_dir = sys.argv[1:4]
request = json.load(open(request_path))

try:
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    plt.show = lambda *args, **kwargs: None
    plt.rcParams["svg.hashsalt"] = "c4t-lessons"
    plt.rcParams["svg.fonttype"] = "none"
    plt.rcParams["figure.dpi"] = 110
except Exception:  # matplotlib is optional
    plt = None

shared = {"__name__": "__main__"}
results = []
for index, cell in enumerate(request["cells"]):
    namespace = shared if request.get("notebook") else {"__name__": "__main__"}
    buffer = io.StringIO()
    inputs = list(cell.get("input") or [])

    def fake_input(prompt=""):
        if not inputs:
            raise EOFError("this program needs more input values (add them with input=\"…\")")
        value = str(inputs.pop(0))
        buffer.write(f"{prompt}{value}\n")
        return value

    builtins.input = fake_input
    error = None
    with contextlib.redirect_stdout(buffer), contextlib.redirect_stderr(io.StringIO()):
        try:
            filename = f"cell{index + 1}.py"
            linecache.cache[filename] = (len(cell["code"]), None, cell["code"].splitlines(True), filename)
            exec(compile(cell["code"], filename, "exec"), namespace)
        except SystemExit:
            pass
        except BaseException as exc:  # shown to the learner as the traceback
            lines = traceback.format_exception(type(exc), exc, exc.__traceback__)
            # Drop the runner's own frame so it reads like running the file.
            kept = [lines[0]] + [line for line in lines[1:] if "run_cells.py" not in line]
            error = "".join(kept).replace(f'File "cell{index + 1}.py"', 'File "main.py"').rstrip()
    figures = []
    if plt is not None:
        for number in plt.get_fignums():
            path = os.path.join(figure_dir, f"{index}-{len(figures)}.svg")
            plt.figure(number).savefig(path, format="svg", bbox_inches="tight", metadata={"Date": None})
            figures.append(path)
        plt.close("all")
    results.append({"out": buffer.getvalue(), "error": error, "figures": figures})

json.dump(results, open(result_path, "w"))
