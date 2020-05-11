import argparse
import csv
import math


class NztmToGeod:
    def __init__(self, input_filename, output_filename):
        self.input_filename = input_filename
        self.output_filename = output_filename

    @staticmethod
    def to_lat_long(easting: float, northing: float):
        """
        Had trouble building the nztm converter c program from `linz geodetic software <https://www.linz.govt.nz/data/geodetic-services/download-geodetic-software>`_
        Found a python script, cheaply from `stackexchange <https://gis.stackexchange.com/questions/225065/converting-nztm-new-zealand-transverse-mercator-to-lat-long>`_ that implements the transformation formula.
        I have tested this and it works, I will relook at the implementation and re-write it at some point in the future :P
        """
        # Common variables for NZTM2000
        a = 6378137
        f = 1 / 298.257222101
        lambda_zero = 173
        n_zero = 10000000
        e_zero = 1600000
        k_zero = 0.9996
        # Calculation: From NZTM to lat/Long
        b = a * (1 - f)
        e_squared = 2 * f - f ** 2
        n_prime = northing - n_zero
        m_prime = n_prime / k_zero
        smn = (a - b) / (a + b)
        g = a * (1 - smn) * (1 - (smn ** 2)) * (1 + 9 * (smn ** 2) / 4 + 225 * (smn ** 4) / 64) * math.pi / 180.0
        sigma = m_prime * math.pi / (180 * g)
        phi_prime = sigma + (3 * smn / 2 - 27 * (smn ** 3) / 32) * math.sin(2 * sigma) + (21 * (smn ** 2) / 16 - 55 * (smn ** 4) / 32) * math.sin(4 * sigma) + (151 * (smn ** 3) / 96) * math.sin(6 * sigma) + (
                1097 * (smn ** 4) / 512) * math.sin(8 * sigma)
        rho_prime = a * (1 - e_squared) / ((1 - e_squared * ((math.sin(phi_prime)) ** 2)) ** 1.5)
        upsilon_prime = a / math.sqrt(1 - e_squared * ((math.sin(phi_prime)) ** 2))
        psi_prime = upsilon_prime / rho_prime
        t_prime = math.tan(phi_prime)
        e_prime = easting - e_zero
        chi = e_prime / (k_zero * upsilon_prime)
        term_1 = t_prime * e_prime * chi / (k_zero * rho_prime * 2)
        term_2 = term_1 * (chi ** 2) / 12 * (-4 * (psi_prime ** 2) + 9 * psi_prime * (1 - (t_prime ** 2)) + 12 * (t_prime ** 2))
        term_3 = t_prime * e_prime * (chi ** 5) / (k_zero * rho_prime * 720) * (8 * (psi_prime ** 4) * (11 - 24 * (t_prime ** 2)) - 12 * (psi_prime ** 3) * (21 - 71 * (t_prime ** 2)) + 15 * (psi_prime ** 2) * (
                15 - 98 * (t_prime ** 2) + 15 * (t_prime ** 4)) + 180 * psi_prime * (5 * (t_prime ** 2) - 3 * (t_prime ** 4)) + 360 * (t_prime ** 4))
        term_4 = t_prime * e_prime * (chi ** 7) / (k_zero * rho_prime * 40320) * (1385 + 3633 * (t_prime ** 2) + 4095 * (t_prime ** 4) + 1575 * (t_prime ** 6))
        term1 = chi * (1 / math.cos(phi_prime))
        term2 = (chi ** 3) * (1 / math.cos(phi_prime)) / 6 * (psi_prime + 2 * (t_prime ** 2))
        term3 = (chi ** 5) * (1 / math.cos(phi_prime)) / 120 * (-4 * (psi_prime ** 3) * (1 - 6 * (t_prime ** 2)) + (psi_prime ** 2) * (9 - 68 * (t_prime ** 2)) + 72 * psi_prime * (t_prime ** 2) + 24 * (t_prime ** 4))
        term4 = (chi ** 7) * (1 / math.cos(phi_prime)) / 5040 * (61 + 662 * (t_prime ** 2) + 1320 * (t_prime ** 4) + 720 * (t_prime ** 6))
        latitude = (phi_prime - term_1 + term_2 - term_3 + term_4) * 180 / math.pi
        longitude = lambda_zero + 180 / math.pi * (term1 - term2 + term3 - term4)
        return latitude, longitude

    def convert_file_to_lat_long(self):
        with open(self.input_filename, newline='') as csvInput, open(self.output_filename, 'w') as csvOutput:
            csvOutput.write("system_id, latitude, longitude\n")

            fieldnames = ['x', 'y', 'system_id']
            reader = csv.DictReader(csvInput, fieldnames=fieldnames)
            next(reader, None)

            for line in reader:
                system_id = line['system_id']
                easting = float(line['x'])
                northing = float(line['y'])
                latitude, longitude = self.to_lat_long(easting, northing)
                csvOutput.write("{}, {}, {}\n".format(system_id, latitude, longitude))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Convert NZTM to lat long")
    parser.add_argument("input", type=str, help='filename of file containing NZTM coordinates')
    parser.add_argument("-o", "--output", type=str, help='filename of file containing the converted lat long coordinates', default='out.csv')

    args = parser.parse_args()
    nztm_converter = NztmToGeod(args.input, args.output)
    nztm_converter.convert_file_to_lat_long()
