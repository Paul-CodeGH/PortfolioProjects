import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import numpy as np

class GraphCanvas:
    def __init__(self, root):
        self.fig, self.ax = plt.subplots(1, 3, figsize=(9, 2))
        self.cpu_data = [0] * 40
        self.ram_data = [0] * 40
        self.gpu_data = [0] * 40

        self.cpu_line, = self.ax[0].plot(self.cpu_data, "r-")
        self.ax[0].set_title("CPU Usage (%)")

        self.ram_line, = self.ax[1].plot(self.ram_data, "b-")
        self.ax[1].set_title("RAM Usage (%)")

        self.gpu_line, = self.ax[2].plot(self.gpu_data, "g-")
        self.ax[2].set_title("GPU Usage (%)")

        self.canvas = FigureCanvasTkAgg(self.fig, master=root)
        self.canvas.get_tk_widget().pack()

    def update_graph(self, cpu, ram, gpu):
        self.cpu_data.append(cpu)
        self.cpu_data.pop(0)
        self.ram_data.append(ram)
        self.ram_data.pop(0)
        self.gpu_data.append(gpu)
        self.gpu_data.pop(0)

        self.cpu_line.set_ydata(self.cpu_data)
        self.ram_line.set_ydata(self.ram_data)
        self.gpu_line.set_ydata(self.gpu_data)

        self.ax[0].relim()
        self.ax[0].autoscale_view()
        self.ax[1].relim()
        self.ax[1].autoscale_view()
        self.ax[2].relim()
        self.ax[2].autoscale_view()

        self.canvas.draw()
